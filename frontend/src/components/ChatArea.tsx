import React, { useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, RefreshCw, Download } from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    thought?: string;
}

interface ChatAreaProps {
    messages: Message[];
    input: string;
    setInput: (value: string) => void;
    onSend: () => void;
    isProcessing: boolean;
    isContextReloading: boolean;
    user: any;
    onGenerateDossier?: () => void;
    isGeneratingDossier?: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({
    messages,
    input,
    setInput,
    onSend,
    isProcessing,
    isContextReloading,
    user,
    onGenerateDossier,
    isGeneratingDossier
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        console.log("ChatArea User State:", user);
    }, [messages, isProcessing, isContextReloading, user]);

    // Note: handleDownload removed or repurposed. Now we use onGenerateDossier.

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            {/* Header for Download Action */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                padding: '20px',
                zIndex: 10
            }}>
                {messages.some(m => m.sender === 'ai' && m.id !== '1') && (
                    <button
                        onClick={onGenerateDossier}
                        disabled={isGeneratingDossier}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'white',
                            border: '1px solid var(--color-border)',
                            padding: '8px 16px',
                            borderRadius: '100px',
                            cursor: isGeneratingDossier ? 'wait' : 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            boxShadow: 'var(--shadow-sm)',
                            opacity: isGeneratingDossier ? 0.7 : 1
                        }}
                    >
                        {isGeneratingDossier ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Download size={16} />
                        )}
                        {isGeneratingDossier ? "Erstelle Dossier..." : "Dossier erstellen"}
                    </button>
                )}
            </div>


            {/* Main Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 100px 32px' }}> {/* Padding bottom for input area */}
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {messages.map(msg => (
                        <div key={msg.id} style={{ display: 'flex', gap: '16px', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                            {msg.sender === 'ai' && (
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-brand)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <Sparkles size={18} color="white" />
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '100%' }}>
                                {/* Thinking Block */}
                                {msg.thought && (
                                    <details style={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        fontSize: '13px',
                                        color: '#6b7280',
                                        cursor: 'pointer',
                                        marginBottom: '4px'
                                    }}>
                                        <summary style={{ fontWeight: 500, userSelect: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Sparkles size={14} />
                                            Mibuntu denkt nach...
                                        </summary>
                                        <div style={{ marginTop: '8px', whiteSpace: 'pre-wrap', lineHeight: '1.5', paddingLeft: '20px', borderLeft: '2px solid #e5e7eb' }}>
                                            {msg.thought}
                                        </div>
                                    </details>
                                )}



                                <div style={{
                                    backgroundColor: msg.sender === 'user' ? '#F3F4F6' : 'white',
                                    color: msg.sender === 'user' ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
                                    padding: '16px 24px',
                                    borderRadius: '24px',
                                    borderTopLeftRadius: msg.sender === 'ai' ? '4px' : '24px',
                                    borderTopRightRadius: msg.sender === 'user' ? '4px' : '24px',
                                    boxShadow: msg.sender === 'ai' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                                    fontSize: '15px',
                                    overflowWrap: 'anywhere'
                                }}>
                                    {msg.sender === 'ai' ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h1: ({ node, ...props }) => <h1 style={{ fontSize: '1.4em', fontWeight: 700, margin: '16px 0 8px 0' }} {...props} />,
                                                h2: ({ node, ...props }) => <h2 style={{ fontSize: '1.2em', fontWeight: 600, margin: '14px 0 8px 0' }} {...props} />,
                                                h3: ({ node, ...props }) => <h3 style={{ fontSize: '1.1em', fontWeight: 600, margin: '12px 0 6px 0' }} {...props} />,
                                                ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', margin: '8px 0' }} {...props} />,
                                                ol: ({ node, ...props }) => <ol style={{ paddingLeft: '20px', margin: '8px 0' }} {...props} />,
                                                li: ({ node, ...props }) => <li style={{ margin: '4px 0' }} {...props} />,
                                                p: ({ node, ...props }) => <p style={{ margin: '8px 0', lineHeight: 1.6 }} {...props} />,
                                                strong: ({ node, ...props }) => <strong style={{ fontWeight: 600 }} {...props} />,
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    ) : (
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Thinking State */}
                    {isProcessing && (
                        <div style={{ display: 'flex', gap: '16px', alignSelf: 'flex-start', maxWidth: '80%' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-brand)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <Sparkles size={18} color="white" />
                            </div>
                            <div style={{
                                backgroundColor: 'white',
                                padding: '16px 24px',
                                borderRadius: '24px',
                                borderTopLeftRadius: '4px',
                                borderTopRightRadius: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                color: 'var(--color-text-secondary)',
                                fontSize: '14px'
                            }}>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Mibuntu denkt nach...</span>
                            </div>
                        </div>
                    )}

                    {/* Reloading Context State */}
                    {isContextReloading && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                            <div style={{
                                backgroundColor: '#EFF6FF',
                                color: '#1D4ED8',
                                padding: '8px 16px',
                                borderRadius: '100px',
                                fontSize: '13px',
                                fontWeight: 500,
                                display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}>
                                <Loader2 size={14} className="animate-spin" />
                                Quellen werden aktualisiert...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '24px 32px',
                background: 'linear-gradient(to top, white 80%, rgba(255,255,255,0))',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{ width: '100%', maxWidth: '800px', position: 'relative' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isProcessing && onSend()}
                        placeholder={isContextReloading ? "Bitte warten, Quellen werden geladen..." : "Frag Mibuntu z.B. 'Erstelle einen Lektionsplan'..."}
                        disabled={isProcessing || isContextReloading}
                        style={{
                            width: '100%',
                            padding: '16px 60px 16px 24px',
                            borderRadius: '100px',
                            border: '1px solid var(--color-border)',
                            fontSize: '16px',
                            outline: 'none',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                            transition: 'all 0.2s',
                            backgroundColor: (isProcessing || isContextReloading) ? '#F9FAFB' : 'white'
                        }}
                        onFocus={(e) => e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)'}
                        onBlur={(e) => e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'}
                    />
                    <button
                        onClick={onSend}
                        disabled={!input.trim() || isProcessing || isContextReloading}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '42px',
                            height: '42px',
                            backgroundColor: (input.trim() && !isProcessing && !isContextReloading) ? 'var(--color-brand)' : '#E5E7EB',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s',
                            border: 'none',
                            cursor: (input.trim() && !isProcessing && !isContextReloading) ? 'pointer' : 'default'
                        }}
                    >
                        {isProcessing || isContextReloading ? (
                            <RefreshCw size={18} className="animate-spin" color="#9CA3AF" />
                        ) : (
                            <Send size={18} color={(input.trim() && !isProcessing && !isContextReloading) ? 'white' : '#9CA3AF'} />
                        )}
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                        Mibuntu kann Fehler machen. Überprüfe wichtige Informationen.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
