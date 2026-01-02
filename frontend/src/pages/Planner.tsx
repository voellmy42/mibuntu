import { useState, useEffect, useCallback } from 'react';
import { generateLessonPlan, generateDossier } from '../services/gemini';
import { extractTextFromPdf } from '../utils/pdfUtils';
import SourceSidebar, { type UploadedFile } from '../components/SourceSidebar';
import ChatArea, { type Message } from '../components/ChatArea';
import OutputView from '../components/OutputView';
import PlannerSetup from '../components/PlannerSetup';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; // Auth imports
import { auth, db } from '../firebase'; // Import db
import { doc, updateDoc } from 'firebase/firestore'; // Firestore imports
import { BookOpen, MessageSquare, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import PaywallModal from '../components/PaywallModal'; // Import PaywallModal

// ... (rest of imports)

// (Keep existing useIsMobile hook)
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

const Planner = () => {
    // ... (Keep existing state)
    const { currentUser, userProfile, refreshProfile } = useAuth();

    // ... (Keep Mobile State & Tab State)
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState<'sources' | 'chat' | 'output'>('chat');

    // ... (Keep Source State)
    const [activeCycle, setActiveCycle] = useState<string>('');
    const [activeWishes, setActiveWishes] = useState<string>('');
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [activeSelectedModules, setActiveSelectedModules] = useState<string[]>(['ZH_DE_Fachbereich_NMG']);
    const [activeUploadedFiles, setActiveUploadedFiles] = useState<UploadedFile[]>([]);
    const [draftSelectedModules, setDraftSelectedModules] = useState<string[]>(['ZH_DE_Fachbereich_NMG']);
    const [draftUploadedFiles, setDraftUploadedFiles] = useState<UploadedFile[]>([]);

    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isContextReloading, setIsContextReloading] = useState(false);
    const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    const hasUnappliedChanges =
        JSON.stringify(activeSelectedModules.sort()) !== JSON.stringify(draftSelectedModules.sort()) ||
        activeUploadedFiles !== draftUploadedFiles;

    // ... (Keep Handlers for Sidebar: handleToggleModule, handleFileUpload, handleRemoveFile, handleApplyChanges)
    const handleToggleModule = (id: string) => {
        setDraftSelectedModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsProcessing(true);
        const newFiles: UploadedFile[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                let content = '';
                if (file.type === 'application/pdf') {
                    const arrayBuffer = await file.arrayBuffer();
                    content = await extractTextFromPdf(arrayBuffer);
                } else if (file.type === 'text/plain') {
                    content = await file.text();
                } else {
                    console.warn(`Unsupported file type: ${file.type}`);
                    continue;
                }
                newFiles.push({ name: file.name, content });
            } catch (error) {
                console.error(`Error reading file ${file.name}:`, error);
            }
        }
        setDraftUploadedFiles(prev => [...prev, ...newFiles]);
        setIsProcessing(false);
    };

    const handleRemoveFile = (index: number) => {
        setDraftUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleApplyChanges = async () => {
        setIsContextReloading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setActiveSelectedModules(draftSelectedModules);
        setActiveUploadedFiles(draftUploadedFiles);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'ai',
            text: `Quellen aktualisiert (${draftSelectedModules.length} Module, ${draftUploadedFiles.filter(f => f.isActive !== false).length} aktive Dateien). Ich bin bereit.`
        }]);
        setIsContextReloading(false);
        if (isMobile) setActiveTab('chat');
    };

    // ... (Keep fetchLehrplanContext)
    // ... (Keep fetchLehrplanContext)
    const fetchLehrplanContext = useCallback(async (): Promise<string> => {
        let combinedText = '';
        const baseUrl = '/lehrplan/';
        for (const moduleId of activeSelectedModules) {
            try {
                const filename = `${moduleId}.pdf`;
                const response = await fetch(`${baseUrl}${filename}`);
                if (!response.ok) { continue; }
                const arrayBuffer = await response.arrayBuffer();
                const text = await extractTextFromPdf(arrayBuffer);
                combinedText += `\n\n--- MODULE: ${moduleId} ---\n${text}`;
            } catch (error) { console.error(error); }
        }
        return combinedText;
    }, [activeSelectedModules]);


    // --- Context & State for Paywall ---
    const [showPaywall, setShowPaywall] = useState(false);

    const incrementUsage = useCallback(async () => {
        if (!currentUser) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                aiInteractionCount: (userProfile?.aiInteractionCount || 0) + 1
            });
            await refreshProfile();
        } catch (e) {
            console.error("Failed to track usage", e);
        }
    }, [currentUser, userProfile, refreshProfile]);

    const processMessage = useCallback(async (textInput: string) => {
        if (!textInput.trim()) return;

        // --- Usage Check ---
        const isPremium = userProfile?.subscriptionStatus === 'premium';
        const usageCount = userProfile?.aiInteractionCount || 0;
        const FREE_LIMIT = 5;

        // Only check usage if user is logged in (implicit requirement, but safe to check)
        // If not logged in, they might not have a profile, but our Auth logic usually mandates login.
        if (currentUser && !isPremium && usageCount >= FREE_LIMIT) {
            setShowPaywall(true);
            return;
        }

        const effectiveApiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!effectiveApiKey) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'ai',
                text: 'System Error: No Gemini API Key configured in environment variables.'
            }]);
            return;
        }

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: textInput };
        setMessages(prev => [...prev, userMsg]);
        setIsProcessing(true);

        try {
            const meaningfulActiveFiles = activeUploadedFiles.filter(f => f.isActive !== false);
            const lehrplanContext = await fetchLehrplanContext();

            const generatedText = await generateLessonPlan(
                userMsg.text,
                meaningfulActiveFiles,
                lehrplanContext,
                effectiveApiKey,
                { cycle: activeCycle, wishes: activeWishes }
            );

            // Increment usage ONLY on successful generation
            await incrementUsage();

            let thought = "";
            let cleanText = generatedText;
            const thinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/;
            const match = generatedText.match(thinkingRegex);
            if (match) {
                thought = match[1].trim();
                cleanText = generatedText.replace(thinkingRegex, "").trim();
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: cleanText,
                thought: thought || undefined
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("Error in handleSend:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'ai',
                text: 'Ein Fehler ist aufgetreten.'
            }]);
        } finally {
            setIsProcessing(false);
        }
    }, [currentUser, userProfile, activeCycle, activeWishes, activeUploadedFiles, fetchLehrplanContext, incrementUsage]); // Added basic deps, might need more refinement

    const handleSend = () => {
        processMessage(input);
        setInput('');
    };

    // ... (Keep handleGenerateDossier, handleToggleFile, handleSetupStart, etc.)
    const handleGenerateDossier = async () => {
        if (!currentUser) {
            alert("Bitte loggen Sie sich ein.");
            try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch { return; }
        }
        const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai');
        if (!lastAiMessage) { alert("Noch kein Lektionsplan vorhanden."); return; }
        setIsGeneratingDossier(true);
        try {
            const effectiveApiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const dossierContent = await generateDossier(lastAiMessage.text, effectiveApiKey);
            const blob = new Blob([dossierContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Lektions_Dossier-${new Date().toISOString().slice(0, 10)}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) { console.error("Dossier generation failed", error); alert("Fehler beim Erstellen des Dossiers."); }
        finally { setIsGeneratingDossier(false); }
    };

    const handleToggleFile = (index: number) => {
        setDraftUploadedFiles(prev => {
            const newFiles = [...prev];
            const currentState = newFiles[index].isActive !== false;
            newFiles[index] = { ...newFiles[index], isActive: !currentState };
            return newFiles;
        });
    };

    const handleSetupStart = async (config: { selectedModules: string[], cycle: string, wishes: string }) => {
        setActiveSelectedModules(config.selectedModules);
        setDraftSelectedModules(config.selectedModules);
        setActiveCycle(config.cycle);
        setActiveWishes(config.wishes);
        setIsSetupComplete(true);
        if (config.wishes.trim()) {
            // Logic handled by useEffect
        } else {
            setMessages([{
                id: '1', sender: 'ai', text: 'Hallo! Ich bin Ihr Mibuntu KI-Assistent. Wie kann ich helfen?'
            }]);
        }
    };

    useEffect(() => {
        if (isSetupComplete && activeWishes && messages.length === 0) {
            processMessage(activeWishes);
        }
    }, [isSetupComplete, activeWishes, processMessage, messages.length]);

    const handleReset = () => {
        setIsSetupComplete(false);
        setActiveCycle('');
        setActiveWishes('');
        setMessages([]);
        setActiveSelectedModules([]);
        setDraftSelectedModules([]);
        setDraftUploadedFiles([]);
        setActiveUploadedFiles([]);
    };

    if (!isSetupComplete) {
        return <PlannerSetup onStart={handleSetupStart} isMobile={isMobile} />;
    }

    const hasAiContent = messages.some(m => m.sender === 'ai');

    return (
        <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA', position: 'relative' }}>

            {/* Paywall Modal */}
            <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

                {/* Module 1: Sources */}
                {(activeTab === 'sources' || !isMobile) && (
                    <div style={{
                        width: isMobile ? '100%' : '350px',
                        flexShrink: 0,
                        borderRight: isMobile ? 'none' : '1px solid var(--color-border)',
                        height: '100%',
                        zIndex: 10
                    }}>
                        <SourceSidebar
                            selectedModuleIds={draftSelectedModules}
                            onToggleModule={handleToggleModule}
                            uploadedFiles={draftUploadedFiles}
                            onUpload={handleFileUpload}
                            onRemoveFile={handleRemoveFile}
                            onToggleFile={handleToggleFile}
                            isProcessing={isProcessing}
                            onApplyChanges={handleApplyChanges}
                            hasUnappliedChanges={hasUnappliedChanges}
                            isChatMode={true}
                            onReset={handleReset}
                        />
                    </div>
                )}

                {/* Module 2: Chat */}
                {(activeTab === 'chat' || !isMobile) && (
                    <div style={{ flex: 1, height: '100%', position: 'relative', overflow: 'hidden' }}>
                        <ChatArea
                            messages={messages}
                            input={input}
                            setInput={setInput}
                            onSend={handleSend}
                            isProcessing={isProcessing}
                            isContextReloading={isContextReloading}
                            user={currentUser}
                            onGenerateDossier={handleGenerateDossier}
                            isGeneratingDossier={isGeneratingDossier}
                            usageCount={userProfile?.aiInteractionCount || 0}
                            isPremium={userProfile?.subscriptionStatus === 'premium'}
                        />
                    </div>
                )}

                {/* Module 3: Output */}
                {isMobile && activeTab === 'output' && (
                    <div style={{ width: '100%', height: '100%', zIndex: 10, backgroundColor: 'white' }}>
                        <OutputView
                            onGenerateDossier={handleGenerateDossier}
                            isGeneratingDossier={isGeneratingDossier}
                            hasContent={hasAiContent}
                        />
                    </div>
                )}

            </div>

            {/* Mobile Tab Navigation */}
            {isMobile && (
                <div style={{
                    height: '60px',
                    backgroundColor: 'white',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    flexShrink: 0,
                    zIndex: 50
                }}>
                    <button
                        onClick={() => setActiveTab('sources')}
                        style={{
                            background: 'none', border: 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                            color: activeTab === 'sources' ? 'var(--color-brand)' : '#9CA3AF',
                            fontSize: '10px', fontWeight: 600
                        }}
                    >
                        <BookOpen size={20} />
                        Quellen
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        style={{
                            background: 'none', border: 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                            color: activeTab === 'chat' ? 'var(--color-brand)' : '#9CA3AF',
                            fontSize: '10px', fontWeight: 600
                        }}
                    >
                        <MessageSquare size={20} />
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('output')}
                        style={{
                            background: 'none', border: 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                            color: activeTab === 'output' ? 'var(--color-brand)' : '#9CA3AF',
                            fontSize: '10px', fontWeight: 600
                        }}
                    >
                        <Download size={20} />
                        Export
                    </button>
                </div>
            )}
        </div>
    );
};

export default Planner;
