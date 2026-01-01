import { useState, useEffect } from 'react';
import { generateLessonPlan, generateDossier } from '../services/gemini';
import { extractTextFromPdf } from '../utils/pdfUtils';
import SourceSidebar, { type UploadedFile } from '../components/SourceSidebar';
import ChatArea, { type Message } from '../components/ChatArea';
import OutputView from '../components/OutputView'; // New Component
import PlannerSetup from '../components/PlannerSetup';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { BookOpen, MessageSquare, Download } from 'lucide-react'; // Icons

// Hook for mobile detection
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
    // API Key State
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
    const [showApiKeyInput, setShowApiKeyInput] = useState(!import.meta.env.VITE_GEMINI_API_KEY);

    // Auth State
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Mobile State
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState<'sources' | 'chat' | 'output'>('chat');

    // Active Source State (Used for Chat)
    const [activeCycle, setActiveCycle] = useState<string>('');
    const [activeWishes, setActiveWishes] = useState<string>('');
    const [isSetupComplete, setIsSetupComplete] = useState(false);

    // Active Source State (Used for Chat)
    const [activeSelectedModules, setActiveSelectedModules] = useState<string[]>(['ZH_DE_Fachbereich_NMG']);
    const [activeUploadedFiles, setActiveUploadedFiles] = useState<UploadedFile[]>([]);

    // Draft Source State (Used for Sidebar UI)
    const [draftSelectedModules, setDraftSelectedModules] = useState<string[]>(['ZH_DE_Fachbereich_NMG']);
    const [draftUploadedFiles, setDraftUploadedFiles] = useState<UploadedFile[]>([]);

    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isContextReloading, setIsContextReloading] = useState(false);

    // New State for Dossier Generation
    const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);


    const [messages, setMessages] = useState<Message[]>([]);

    // Check for unapplied changes
    const hasUnappliedChanges =
        JSON.stringify(activeSelectedModules.sort()) !== JSON.stringify(draftSelectedModules.sort()) ||
        activeUploadedFiles !== draftUploadedFiles;

    // Handlers for Sidebar
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

        // Simulate context reloading / processing time
        await new Promise(resolve => setTimeout(resolve, 800));

        setActiveSelectedModules(draftSelectedModules);
        // Apply draft files to active, fully replacing the list
        setActiveUploadedFiles(draftUploadedFiles);

        // Optional: Add a system message indicating context update
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'ai',
            text: `Quellen aktualisiert (${draftSelectedModules.length} Module, ${draftUploadedFiles.filter(f => f.isActive !== false).length} aktive Dateien). Ich bin bereit.`
        }]);

        setIsContextReloading(false);
        // On mobile, switch to chat after applying
        if (isMobile) setActiveTab('chat');
    };


    // Handlers for Chat
    const fetchLehrplanContext = async (): Promise<string> => {
        let combinedText = '';
        const baseUrl = '/lehrplan/';

        for (const moduleId of activeSelectedModules) {
            try {
                const filename = `${moduleId}.pdf`;
                const response = await fetch(`${baseUrl}${filename}`);
                if (!response.ok) {
                    console.warn(`Could not fetch Lehrplan module: ${filename}`);
                    continue;
                }
                const arrayBuffer = await response.arrayBuffer();
                const text = await extractTextFromPdf(arrayBuffer);
                combinedText += `\n\n--- MODULE: ${moduleId} ---\n${text}`;
            } catch (error) {
                console.error(`Error processing Lehrplan module ${moduleId}:`, error);
            }
        }
        return combinedText;
    };

    const processMessage = async (textInput: string) => {
        if (!textInput.trim()) return;

        const effectiveApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;

        if (!effectiveApiKey) {
            console.log("No API Key found");
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'ai',
                text: 'Bitte geben Sie zuerst einen gültigen Gemini API Key ein.'
            }]);
            setShowApiKeyInput(true);
            return;
        }

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: textInput };
        setMessages(prev => [...prev, userMsg]);
        setIsProcessing(true);

        try {
            console.log("Gathering context...");
            // 1. Gather Context (using ACTIVE sources)
            // Filter only active files
            const meaningfulActiveFiles = activeUploadedFiles.filter(f => f.isActive !== false);
            const lehrplanContext = await fetchLehrplanContext();

            console.log("Context gathered, calling Gemini...");

            // 2. Call Gemini
            const generatedText = await generateLessonPlan(
                userMsg.text,
                meaningfulActiveFiles,
                lehrplanContext,
                effectiveApiKey,
                {
                    cycle: activeCycle,
                    wishes: activeWishes
                }
            );
            console.log("Gemini response received");

            // Parse output for <thinking> tags
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
                text: 'Ein Fehler ist aufgetreten. Bitte überprüfen Sie die Konsole für Details.'
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSend = () => {
        processMessage(input);
        setInput('');
    };

    const handleGenerateDossier = async () => {
        if (!user) {
            // Auth check
            alert("Bitte loggen Sie sich ein.");
            try {
                await signInWithPopup(auth, new GoogleAuthProvider());
            } catch (error) {
                console.error("Login failed", error);
                return;
            }
        }

        // Find last AI message
        const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai');
        if (!lastAiMessage) {
            alert("Noch kein Lektionsplan vorhanden.");
            return;
        }

        setIsGeneratingDossier(true);
        try {
            const effectiveApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
            const dossierContent = await generateDossier(lastAiMessage.text, effectiveApiKey);

            // Download
            const blob = new Blob([dossierContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Lektions_Dossier-${new Date().toISOString().slice(0, 10)}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Dossier generation failed", error);
            alert("Fehler beim Erstellen des Dossiers.");
        } finally {
            setIsGeneratingDossier(false);
        }
    };

    const handleToggleFile = (index: number) => {
        setDraftUploadedFiles(prev => {
            const newFiles = [...prev];
            // Toggle logic: if undefined, treat as true -> becomes false.
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

        // If user provided wishes, treat it as the first prompt
        if (config.wishes.trim()) {
            // Logic handled by useEffect
        } else {
            setMessages([{
                id: '1',
                sender: 'ai',
                text: 'Hallo! Ich bin Ihr Mibuntu KI-Assistent. Wie kann ich helfen?'
            }]);
        }
    };

    // Effect to trigger initial wish processing once setup is complete and state is ready
    useEffect(() => {
        if (isSetupComplete && activeWishes && messages.length === 0) {
            processMessage(activeWishes);
        }
    }, [isSetupComplete, activeWishes]);


    const handleReset = () => {
        setIsSetupComplete(false);
        setActiveCycle('');
        setActiveWishes('');
        setMessages([]);
        setActiveSelectedModules([]);
        setDraftSelectedModules([]);
        setDraftUploadedFiles([]); // Also reset active? User choice.
        setActiveUploadedFiles([]);
    };

    if (!isSetupComplete) {
        return <PlannerSetup onStart={handleSetupStart} isMobile={isMobile} />;
    }

    // Has AI Content for Output Tab check
    const hasAiContent = messages.some(m => m.sender === 'ai');

    return (
        <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA' }}>
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
                            apiKey={apiKey}
                            onApiKeyChange={setApiKey}
                            showApiKeyInput={showApiKeyInput}
                            setShowApiKeyInput={setShowApiKeyInput}
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
                            user={user}
                            onGenerateDossier={handleGenerateDossier}
                            isGeneratingDossier={isGeneratingDossier}
                        />
                    </div>
                )}

                {/* Module 3: Output (Mobile Only view for checking, or Modal on desktop?) 
                     For now, let's keep it as a tab on mobile. On desktop, currently it's a button in Chat.
                     We can allow the OutputView to be shown on Desktop if we want a 3-column layout?
                     The user asked for "Three Tab layout where a mobile user can swipe".
                     Let's disable OutputView on Desktop for now unless we want to replace the button.
                     Actually, the prompt implies "Module 3: Output" is a distinct module. 
                     Let's render it if activeTab is output. On Desktop, maybe we don't show it or we show it as a modal?
                     For simplicity: Hide on Desktop (since button is in Chat) OR toggle it.
                     Let's stick to Mobile strict tabs.
                 */}
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
                    zIndex: 50 // Above content
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
