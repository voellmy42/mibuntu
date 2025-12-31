import React from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';

interface OutputViewProps {
    onGenerateDossier: () => void;
    isGeneratingDossier: boolean;
    hasContent: boolean; // True if there is an AI response to process
}

const OutputView: React.FC<OutputViewProps> = ({
    onGenerateDossier,
    isGeneratingDossier,
    hasContent
}) => {
    return (
        <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Download size={24} /> Export & Ergebnisse
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                Hier können Sie Ihre Ergebnisse herunterladen und weiterverarbeiten.
            </p>

            <div style={{
                backgroundColor: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '48px', height: '48px',
                        backgroundColor: '#EFF6FF',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#1D4ED8'
                    }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>Lektions-Dossier</h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                            Generiert aus dem aktuellen Chat-Verlauf.
                        </p>
                    </div>
                </div>

                <button
                    onClick={onGenerateDossier}
                    disabled={isGeneratingDossier || !hasContent}
                    style={{
                        padding: '10px 16px',
                        backgroundColor: (isGeneratingDossier || !hasContent) ? '#E5E7EB' : 'var(--color-brand)',
                        color: (isGeneratingDossier || !hasContent) ? '#9CA3AF' : 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 500,
                        cursor: (isGeneratingDossier || !hasContent) ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    {isGeneratingDossier ? (
                        <>
                            <Loader2 size={16} className="animate-spin" /> Generiere...
                        </>
                    ) : (
                        <>
                            <Download size={16} /> Erstellen & Laden
                        </>
                    )}
                </button>
            </div>

            {!hasContent && (
                <div style={{ marginTop: '16px', fontSize: '13px', color: '#EF4444', textAlign: 'center' }}>
                    Bitte erstellen Sie zuerst einen Lektionsplan im Chat.
                </div>
            )}
        </div>
    );
};

export default OutputView;
