import React, { useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, RefreshCw } from 'lucide-react';

export interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

interface ChatAreaProps {
    messages: Message[];
    input: string;
    setInput: (value: string) => void;
    onSend: () => void;
    isProcessing: boolean;
    isContextReloading: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({
    messages,
    input,
    setInput,
    onSend,
    isProcessing,
    isContextReloading
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isProcessing, isContextReloading]);

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
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
                            <div style={{
                                backgroundColor: msg.sender === 'user' ? '#F3F4F6' : 'white',
                                color: msg.sender === 'user' ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
                                padding: '16px 24px',
                                borderRadius: '24px',
                                borderTopLeftRadius: msg.sender === 'ai' ? '4px' : '24px',
                                borderTopRightRadius: msg.sender === 'user' ? '4px' : '24px',
                                boxShadow: msg.sender === 'ai' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.6',
                                fontSize: '15px'
                            }}>
                                {msg.text}
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
