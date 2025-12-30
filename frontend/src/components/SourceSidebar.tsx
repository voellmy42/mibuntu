import React, { useRef } from 'react';
import { FileText, CheckCircle2, Paperclip, Loader2, Key, RefreshCw, Trash2 } from 'lucide-react';
import { MODULES } from '../data/lehrplan';

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
    apiKey: string;
    onApiKeyChange: (key: string) => void;
    showApiKeyInput: boolean;
    setShowApiKeyInput: (show: boolean) => void;
    isProcessing: boolean;
    onApplyChanges: () => void;
    hasUnappliedChanges: boolean;
    isChatMode?: boolean;
    onReset?: () => void;
}

const SourceSidebar: React.FC<SourceSidebarProps> = ({
    selectedModuleIds,
    onToggleModule,
    uploadedFiles,
    onUpload,
    onRemoveFile,
    onToggleFile,
    apiKey,
    onApiKeyChange,
    showApiKeyInput,
    setShowApiKeyInput,
    isProcessing,
    onApplyChanges,
    hasUnappliedChanges,
    isChatMode = false,
    onReset
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div style={{
            width: '350px',
            borderRight: '1px solid var(--color-border)',
            backgroundColor: '#F9FAFB',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-primary)' }}>
                        <FileText size={20} /> Quellen
                    </h3>
                    {isChatMode && onReset && (
                        <button
                            onClick={onReset}
                            style={{
                                fontSize: '12px',
                                color: 'var(--color-brand)',
                                background: 'transparent',
                                border: '1px solid var(--color-brand)',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Neuer Plan
                        </button>
                    )}
                </div>

                <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                    {isChatMode ? 'Verwalten Sie Ihre zusätzlichen Quellen.' : 'Wähle Materialien für den Planer.'}
                </p>

                {/* Chat Mode Context Badge */}
                {isChatMode && (
                    <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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


                {/* API Key Toggle/Input */}
                <div style={{ marginTop: '16px' }}>
                    <button
                        onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                        style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Key size={14} /> {showApiKeyInput ? 'API Key verbergen' : 'API Key verwalten'}
                    </button>

                    {showApiKeyInput && (
                        <input
                            type="password"
                            placeholder="Gemini API Key eingeben"
                            value={apiKey}
                            onChange={(e) => onApiKeyChange(e.target.value)}
                            style={{
                                width: '100%',
                                marginTop: '8px',
                                padding: '8px 12px',
                                fontSize: '13px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                outline: 'none'
                            }}
                        />
                    )}
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

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
                                    onChange={(e) => {
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

            {/* Footer Action */}
            {hasUnappliedChanges && (
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
