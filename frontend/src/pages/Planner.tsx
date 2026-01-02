import { useState, useEffect, useCallback } from 'react';
import { Document, Packer, Paragraph, HeadingLevel, Header, Footer, TextRun, AlignmentType } from 'docx';
import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { saveAs } from 'file-saver';
import { generateLessonPlan, generateDossier, generateStudentHandout, generatePresentation } from '../services/gemini';
import { extractTextFromPdf } from '../utils/pdfUtils';
import SourceSidebar, { type UploadedFile } from '../components/SourceSidebar';
import ChatArea, { type Message } from '../components/ChatArea';
import OutputView from '../components/OutputView';
import ExportModal from '../components/ExportModal';
import PlannerSetup from '../components/PlannerSetup';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { BookOpen, MessageSquare, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaywallModal from '../components/PaywallModal';


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
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isGeneratingWord, setIsGeneratingWord] = useState(false);
    const [isGeneratingPpt, setIsGeneratingPpt] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
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

    const handleGeneratePdf = async () => {
        if (!checkAuth()) return;
        const lastAiMessage = getLastAiMessage();
        if (!lastAiMessage) return;

        setIsGeneratingPdf(true);
        try {
            const effectiveApiKey = import.meta.env.VITE_GEMINI_API_KEY;
            // Generate content using the Dossier prompt - this returns Markdown text
            const dossierContent = await generateDossier(lastAiMessage.text, effectiveApiKey);

            // Create PDF using jsPDF
            const doc = new jsPDF();

            // Branding Header
            doc.setFillColor(100, 108, 255); // Mibuntu Blue
            doc.rect(0, 0, 210, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Mibuntu | Lektions-Dossier', 10, 13);

            // Reset for Content
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');

            // Simple text wrapping for the markdown content
            // Note: properly rendering rich markdown to PDF client-side is complex.
            // We will do a best-effort text dump or simple splitting.
            // For a better experience, we might want to use HTML rendering, but let's stick to text for stability.

            const splitText = doc.splitTextToSize(dossierContent, 180);
            let y = 30;

            // Iterate and add pages if needed
            for (let i = 0; i < splitText.length; i++) {
                if (y > 280) {
                    doc.addPage();
                    y = 20; // Margin top on new page
                }
                doc.text(splitText[i], 15, y);
                y += 6; // Line height
            }

            // Footer Branding
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setTextColor(150, 150, 150);
                doc.text('Erstellt mit Mibuntu KI', 105, 290, { align: 'center' });
            }

            doc.save(`Lektions_Dossier-${new Date().toISOString().slice(0, 10)}.pdf`);

        } catch (error) { console.error("PDF generation failed", error); alert("Fehler beim Erstellen des PDFs."); }
        finally { setIsGeneratingPdf(false); }
    };

    const handleGenerateWord = async () => {
        if (!checkAuth()) return;
        const lastAiMessage = getLastAiMessage();
        if (!lastAiMessage) return;

        setIsGeneratingWord(true);
        try {
            const effectiveApiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const jsonString = await generateStudentHandout(lastAiMessage.text, effectiveApiKey);
            const content = JSON.parse(jsonString);

            // Create Document with Branding
            const doc = new Document({
                styles: {
                    default: {
                        heading1: {
                            run: {
                                color: "646CFF",
                                bold: true,
                                size: 32, // 16pt
                            },
                            paragraph: {
                                spacing: { after: 120 },
                            },
                        },
                    },
                },
                sections: [{
                    properties: {},
                    headers: {
                        default: new Header({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "Mibuntu",
                                            bold: true,
                                            color: "646CFF",
                                            size: 24,
                                        }),
                                        new TextRun({
                                            text: " | Schüler-Dossier",
                                            color: "9CA3AF",
                                            size: 24,
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    },
                    footers: {
                        default: new Footer({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: "Erstellt mit Mibuntu KI",
                                            color: "9CA3AF",
                                            size: 16,
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    },
                    children: [
                        new Paragraph({
                            text: content.title || "Arbeitsblatt",
                            heading: HeadingLevel.TITLE,
                            alignment: AlignmentType.CENTER,
                            run: {
                                size: 48, // 24pt
                                bold: true,
                                color: "111827",
                            },
                            spacing: { after: 400 },
                        }),
                        ...(content.sections || []).flatMap((sec: any) => [
                            new Paragraph({
                                text: sec.title || "",
                                heading: HeadingLevel.HEADING_1,
                            }),
                            new Paragraph({
                                text: sec.content || "",
                                spacing: { after: 200 },
                            }),
                            new Paragraph({ text: "" }),
                        ])
                    ],
                }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `Arbeitsblatt-${new Date().toISOString().slice(0, 10)}.docx`);

        } catch (error) { console.error("Word generation failed", error); alert("Fehler beim Erstellen des Word-Dokuments."); }
        finally { setIsGeneratingWord(false); }
    };

    const handleGeneratePpt = async () => {
        if (!checkAuth()) return;
        const lastAiMessage = getLastAiMessage();
        if (!lastAiMessage) return;

        setIsGeneratingPpt(true);
        try {
            const effectiveApiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const jsonString = await generatePresentation(lastAiMessage.text, effectiveApiKey);
            const content = JSON.parse(jsonString);

            let pres = new PptxGenJS();
            pres.layout = 'LAYOUT_16x9';

            // Define Master Slide with Branding
            pres.defineSlideMaster({
                title: 'MASTER_SLIDE',
                background: { color: 'FFFFFF' },
                objects: [
                    {
                        text: {
                            text: "Mibuntu",
                            options: { x: 0.5, y: 0.2, fontSize: 14, color: '646CFF', bold: true }
                        }
                    },
                    {
                        line: {
                            x: 0.5, y: 0.6, w: '90%', h: 0, line: { color: 'E5E7EB', width: 1 }
                        }
                    },
                    {
                        text: {
                            text: "Erstellt mit Mibuntu KI",
                            options: { x: 0.5, y: '92%', fontSize: 10, color: '9CA3AF' }
                        }
                    }
                ]
            });

            // Title Slide (Custom Style)
            let slide = pres.addSlide();
            slide.background = { color: '646CFF' }; // Brand Color Background
            slide.addText(content.title || "Präsentation", {
                x: 1, y: 2, w: '80%', h: 1.5,
                fontSize: 44, bold: true, align: 'center', color: 'FFFFFF'
            });
            slide.addText("Lektionsplan", {
                x: 1, y: 3.5, w: '80%', h: 1,
                fontSize: 20, align: 'center', color: 'E0E7FF'
            });

            // Content Slides
            (content.slides || []).forEach((s: any) => {
                let slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
                slide.addText(s.title || "", {
                    x: 0.5, y: 0.8, w: '90%', h: 0.8,
                    fontSize: 28, bold: true, color: '111827'
                });

                if (s.bullets && Array.isArray(s.bullets)) {
                    s.bullets.forEach((bullet: string, i: number) => {
                        slide.addText(bullet, {
                            x: 0.8, y: 1.8 + (i * 0.6), w: '85%', h: 0.5,
                            fontSize: 18, color: '374151', bullet: { code: '2022' }
                        });
                    });
                }
                if (s.speakerNotes) {
                    slide.addNotes(s.speakerNotes);
                }
            });

            await pres.writeFile({ fileName: `Praesention-${new Date().toISOString().slice(0, 10)}.pptx` });

        } catch (error) { console.error("PPT generation failed", error); alert("Fehler beim Erstellen der Präsentation."); }
        finally { setIsGeneratingPpt(false); }
    };

    const checkAuth = () => {
        if (!currentUser) {
            alert("Bitte loggen Sie sich ein.");
            signInWithPopup(auth, new GoogleAuthProvider()).catch(() => { });
            return false;
        }
        return true;
    };

    const getLastAiMessage = () => {
        const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai');
        if (!lastAiMessage) { alert("Noch kein Lektionsplan vorhanden."); return null; }
        return lastAiMessage;
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
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onGeneratePdf={handleGeneratePdf}
                onGenerateWord={handleGenerateWord}
                onGeneratePpt={handleGeneratePpt}
                isGeneratingPdf={isGeneratingPdf}
                isGeneratingWord={isGeneratingWord}
                isGeneratingPpt={isGeneratingPpt}
                hasContent={hasAiContent}
            />

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
                            onOpenExport={() => setShowExportModal(true)}
                            usageCount={userProfile?.aiInteractionCount || 0}
                            isPremium={userProfile?.subscriptionStatus === 'premium'}
                        />
                    </div>
                )}

                {/* Module 3: Output */}
                {isMobile && activeTab === 'output' && (
                    <div style={{ width: '100%', height: '100%', zIndex: 10, backgroundColor: 'white' }}>
                        <OutputView
                            onGeneratePdf={handleGeneratePdf}
                            onGenerateWord={handleGenerateWord}
                            onGeneratePpt={handleGeneratePpt}
                            isGeneratingPdf={isGeneratingPdf}
                            isGeneratingWord={isGeneratingWord}
                            isGeneratingPpt={isGeneratingPpt}
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
