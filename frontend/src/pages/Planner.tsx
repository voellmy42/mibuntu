import { useState } from 'react';
import { generateLessonPlan } from '../services/gemini';
import { extractTextFromPdf } from '../utils/pdfUtils';
import SourceSidebar, { type UploadedFile } from '../components/SourceSidebar';
import ChatArea, { type Message } from '../components/ChatArea';

const Planner = () => {
    // API Key State
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
    const [showApiKeyInput, setShowApiKeyInput] = useState(!import.meta.env.VITE_GEMINI_API_KEY);

    // Active Source State (Used for Chat)
    const [activeSelectedModules, setActiveSelectedModules] = useState<string[]>(['ZH_DE_Fachbereich_NMG']);
    const [activeUploadedFiles, setActiveUploadedFiles] = useState<UploadedFile[]>([]);

    // Draft Source State (Used for Sidebar UI)
    const [draftSelectedModules, setDraftSelectedModules] = useState<string[]>(['ZH_DE_Fachbereich_NMG']);
    const [draftUploadedFiles, setDraftUploadedFiles] = useState<UploadedFile[]>([]);

    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isContextReloading, setIsContextReloading] = useState(false);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'ai', text: 'Hallo! Ich bin Ihr Mibuntu KI-Assistent. Basierend auf dem Lehrplan 21 (NMG), was möchten Sie heute vorbereiten?' }
    ]);

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
        setActiveUploadedFiles(draftUploadedFiles);

        // Optional: Add a system message indicating context update
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'ai',
            text: `Quellen aktualisiert (${draftSelectedModules.length} Module, ${draftUploadedFiles.length} Dateien). Ich bin bereit.`
        }]);

        setIsContextReloading(false);
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

    const handleSend = async () => {
        if (!input.trim()) return;
        if (!apiKey) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'ai',
                text: 'Bitte geben Sie zuerst einen gültigen Gemini API Key ein.'
            }]);
            setShowApiKeyInput(true);
            return;
        }

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsProcessing(true);

        try {
            // 1. Gather Context (using ACTIVE sources)
            const lehrplanContext = await fetchLehrplanContext();

            // 2. Call Gemini
            const generatedText = await generateLessonPlan(
                userMsg.text,
                activeUploadedFiles,
                lehrplanContext,
                apiKey
            );

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: generatedText
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'ai',
                text: 'Ein Fehler ist aufgetreten. Bitte überprüfen Sie Ihren API Key und versuchen Sie es erneut.'
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 80px)', display: 'flex', backgroundColor: '#FAFAFA' }}>
            <SourceSidebar
                selectedModuleIds={draftSelectedModules}
                onToggleModule={handleToggleModule}
                uploadedFiles={draftUploadedFiles}
                onUpload={handleFileUpload}
                onRemoveFile={handleRemoveFile}
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
                showApiKeyInput={showApiKeyInput}
                setShowApiKeyInput={setShowApiKeyInput}
                isProcessing={isProcessing}
                onApplyChanges={handleApplyChanges}
                hasUnappliedChanges={hasUnappliedChanges}
            />

            <ChatArea
                messages={messages}
                input={input}
                setInput={setInput}
                onSend={handleSend}
                isProcessing={isProcessing}
                isContextReloading={isContextReloading}
            />
        </div>
    );
};

export default Planner;
