import React, { useRef, useState } from 'react';
import { FileText, CheckCircle2, Paperclip, Loader2, RefreshCw, Trash2, History, MessageSquare, Plus } from 'lucide-react';
import { MODULES } from '../data/lehrplan';
import type { Conversation } from '../services/chatService';

export interface UploadedFile {
    name: string;
    content: string;
    isActive?: boolean;
}

interface SourceSidebarProps {
    selectedModuleIds: string[];
    onToggleModule: (id: string) => void;
    uploadedFiles: UploadedFile[];
    onUpload: (files: FileList | null) => void;
    onRemoveFile: (index: number) => void;
    onToggleFile?: (index: number) => void;
    isProcessing: boolean;
    onApplyChanges: () => void;
    hasUnappliedChanges: boolean;
    isChatMode?: boolean;
    onReset?: () => void;
    // History Props
    conversations?: Conversation[];
    onSelectConversation?: (conversation: Conversation) => void;
    onDeleteConversation?: (id: string) => void;
    activeConversationId?: string;
}

const SourceSidebar: React.FC<SourceSidebarProps> = ({
    selectedModuleIds,
    onToggleModule,
    uploadedFiles,
    onUpload,
    onRemoveFile,
    onToggleFile,
    isProcessing,
    onApplyChanges,
    hasUnappliedChanges,
    isChatMode = false,
    onReset,
    conversations = [],
    onSelectConversation,
    onDeleteConversation,
    activeConversationId
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [sidebarTab, setSidebarTab] = useState<'sources' | 'history'>('sources');

    // Group conversations by date (Today, Yesterday, Last 7 Days, Older)
    const groupedConversations = (() => {
        if (!conversations.length) return {};

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterday = today - 86400000;
        const last7Days = today - 7 * 86400000;

        const groups: Record<string, Conversation[]> = {
            'Heute': [],
            'Gestern': [],
            'Letzte 7 Tage': [],
            'Älter': []
        };

        conversations.forEach(conv => {
            const date = conv.updatedAt?.toMillis ? conv.updatedAt.toMillis() : (conv.updatedAt || Date.now());
            if (date >= today) groups['Heute'].push(conv);
            else if (date >= yesterday) groups['Gestern'].push(conv);
            else if (date >= last7Days) groups['Letzte 7 Tage'].push(conv);
            else groups['Älter'].push(conv);
        });

        // Remove empty groups
        Object.keys(groups).forEach(key => {
            if (groups[key].length === 0) delete groups[key];
        });

        return groups;
    })();

    return (
        <div style={{
            width: '100%',
            borderRight: '1px solid var(--color-border)',
            backgroundColor: '#F9FAFB',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            {/* Tab Header IF chat mode */}
            {isChatMode ? (
                <div style={{ backgroundColor: 'white', borderBottom: '1px solid var(--color-border)' }}>
                    {/* Top Row: New Chat Button if in History */}

                    <div style={{ display: 'flex' }}>
                        <button
                            onClick={() => setSidebarTab('sources')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                fontSize: '13px',
                                fontWeight: 600,
                                borderBottom: sidebarTab === 'sources' ? '2px solid var(--color-brand)' : '1px solid transparent',
                                color: sidebarTab === 'sources' ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                                background: 'none', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}
                        >
                            <FileText size={16} /> Quellen
                        </button>
                        <button
                            onClick={() => setSidebarTab('history')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                fontSize: '13px',
                                fontWeight: 600,
                                borderBottom: sidebarTab === 'history' ? '2px solid var(--color-brand)' : '1px solid transparent',
                                color: sidebarTab === 'history' ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                                background: 'none', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}
                        >
                            <History size={16} /> Verlauf
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-primary)' }}>
                            <FileText size={20} /> Quellen
                        </h3>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                        Wähle Materialien für den Planer.
                    </p>
                </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {sidebarTab === 'sources' && (
                    <div style={{ padding: '24px' }}>
                        {/* Sources Content */}
                        {isChatMode && onReset && (
                            <button
                                onClick={onReset}
                                style={{
                                    width: '100%',
                                    marginBottom: '20px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '10px',
                                    backgroundColor: 'white',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: 'var(--color-text-primary)',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                }}
                            >
                                <Plus size={16} className="text-brand" />
                                Neuer Plan
                            </button>
                        )}

                        {/* Context Badges */}
                        {isChatMode && (
                            <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {MODULES.filter(m => selectedModuleIds.includes(m.id)).map(module => (
                                    <span key={module.id} style={{
                                        fontSize: '11px',
                                        padding: '4px 8px',
                                        borderRadius: '100px',
                                        backgroundColor: module.color + '20',
                                        color: module.color,
                                        fontWeight: 600,
                                        border: `1px solid ${module.color}40`
                                    }}>
                                        {module.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Uploaded Files Section */}
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Eigene Dateien
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{uploadedFiles.length}</span>
                            </div>

                            <div style={{ display: 'grid', gap: '8px' }}>
                                {uploadedFiles.map((file, idx) => (
                                    <div key={idx} style={{
                                        padding: '10px 12px',
                                        background: 'white',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                        opacity: file.isActive === false ? 0.6 : 1
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={file.isActive !== false} // Default true
                                            onChange={() => {
                                                if (onToggleFile) onToggleFile(idx);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <FileText size={14} color="#6B7280" />
                                        </div>
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, fontWeight: 500 }}>{file.name}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onRemoveFile(idx); }}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', display: 'flex' }}
                                            title="Entfernen"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={(e) => onUpload(e.target.files)}
                                    accept=".pdf,.txt"
                                    multiple
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isProcessing}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px dashed #D1D5DB',
                                        borderRadius: '8px',
                                        color: '#6B7280',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        fontSize: '13px',
                                        backgroundColor: 'transparent',
                                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        marginTop: '4px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9CA3AF'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                                >
                                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
                                    {isProcessing ? 'Wird verarbeitet...' : 'Datei hinzufügen'}
                                </button>
                            </div>
                        </div>

                        {/* Lehrplan Modules - Only show in non-chat mode (Setup) */}
                        {!isChatMode && (
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Lehrplan 21 Module
                                </div>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {MODULES.map(module => {
                                        const isSelected = selectedModuleIds.includes(module.id);
                                        return (
                                            <div
                                                key={module.id}
                                                onClick={() => onToggleModule(module.id)}
                                                style={{
                                                    padding: '10px 12px',
                                                    borderRadius: '8px',
                                                    backgroundColor: isSelected ? 'white' : 'transparent',
                                                    border: `1px solid ${isSelected ? module.color : 'transparent'}`,
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    transition: 'all 0.2s',
                                                    boxShadow: isSelected ? `0 2px 4px ${module.color}15` : 'none'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f3f4f6';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <div style={{
                                                    width: '18px', height: '18px', borderRadius: '5px',
                                                    border: `2px solid ${isSelected ? module.color : '#D1D5DB'}`,
                                                    backgroundColor: isSelected ? module.color : 'transparent',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    {isSelected && <CheckCircle2 size={14} color="white" />}
                                                </div>
                                                <span style={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>{module.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {sidebarTab === 'history' && (
                    <div style={{ padding: '16px' }}>
                        {conversations.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
                                <History size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <p style={{ fontSize: '13px' }}>Keine vergangenen Chats gefunden.</p>
                            </div>
                        ) : (
                            Object.entries(groupedConversations).map(([group, convs]) => (
                                <div key={group} style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', marginBottom: '8px', textTransform: 'uppercase' }}>
                                        {group}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {convs.map(conv => (
                                            <div
                                                key={conv.id}
                                                onClick={() => onSelectConversation && onSelectConversation(conv)}
                                                style={{
                                                    padding: '10px 12px',
                                                    borderRadius: '8px',
                                                    backgroundColor: activeConversationId === conv.id ? 'white' : 'transparent',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex', alignItems: 'center', gap: '10px',
                                                    border: activeConversationId === conv.id ? '1px solid var(--color-border)' : '1px solid transparent'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (activeConversationId !== conv.id) e.currentTarget.style.backgroundColor = '#F3F4F6';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (activeConversationId !== conv.id) e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <MessageSquare size={16} color="#6B7280" />
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {conv.title || 'Neuer Chat'}
                                                    </div>
                                                </div>
                                                {onDeleteConversation && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('Chat wirklich löschen?')) {
                                                                onDeleteConversation(conv.id);
                                                            }
                                                        }}
                                                        style={{
                                                            border: 'none', background: 'none',
                                                            color: '#D1D5DB', cursor: 'pointer',
                                                            padding: '4px'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                                                        onMouseLeave={(e) => e.currentTarget.style.color = '#D1D5DB'}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Footer Action */}
            {hasUnappliedChanges && sidebarTab === 'sources' && (
                <div style={{ padding: '20px 24px', borderTop: '1px solid var(--color-border)', backgroundColor: 'white' }}>
                    <button
                        onClick={onApplyChanges}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'var(--color-brand)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            boxShadow: '0 4px 6px -1px var(--color-brand-transparent)'
                        }}
                    >
                        <RefreshCw size={18} />
                        Quellen aktualisieren
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '8px' }}>
                        Änderungen müssen bestätigt werden.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SourceSidebar;
