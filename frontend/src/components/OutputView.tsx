import React from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';

interface OutputViewProps {
    onGeneratePdf: () => void;
    onGenerateWord: () => void;
    onGeneratePpt: () => void;
    isGeneratingPdf: boolean;
    isGeneratingWord: boolean;
    isGeneratingPpt: boolean;
    hasContent: boolean;
}

const OutputView: React.FC<OutputViewProps> = ({
    onGeneratePdf,
    onGenerateWord,
    onGeneratePpt,
    isGeneratingPdf,
    isGeneratingWord,
    isGeneratingPpt,
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* PDF / Markdown Export */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ ...iconContainerStyle, color: '#DC2626', backgroundColor: '#FEF2F2' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>Lektions-Dossier (PDF)</h3>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                                Das komplette Dossier als PDF/Markdown.
                            </p>
                        </div>
                    </div>
                    <ExportButton
                        onClick={onGeneratePdf}
                        isLoading={isGeneratingPdf}
                        disabled={!hasContent || isGeneratingWord || isGeneratingPpt}
                        label="PDF Laden"
                    />
                </div>

                {/* Word / Student Handout Export */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ ...iconContainerStyle, color: '#2563EB', backgroundColor: '#EFF6FF' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>Schüler-Dossier (Word)</h3>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                                Editierbares Arbeitsblatt für SuS.
                            </p>
                        </div>
                    </div>
                    <ExportButton
                        onClick={onGenerateWord}
                        isLoading={isGeneratingWord}
                        disabled={!hasContent || isGeneratingPdf || isGeneratingPpt}
                        label="Word Laden"
                    />
                </div>

                {/* PowerPoint Export */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ ...iconContainerStyle, color: '#EA580C', backgroundColor: '#FFF7ED' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>Präsentation (PPT)</h3>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                                16:9 Folien für die Lektion.
                            </p>
                        </div>
                    </div>
                    <ExportButton
                        onClick={onGeneratePpt}
                        isLoading={isGeneratingPpt}
                        disabled={!hasContent || isGeneratingPdf || isGeneratingWord}
                        label="PPT Laden"
                    />
                </div>

            </div>

            {!hasContent && (
                <div style={{ marginTop: '24px', fontSize: '13px', color: '#EF4444', textAlign: 'center' }}>
                    Bitte erstellen Sie zuerst einen Lektionsplan im Chat.
                </div>
            )}
        </div>
    );
};

const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: 'var(--shadow-sm)'
};

const iconContainerStyle: React.CSSProperties = {
    width: '48px', height: '48px',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const ExportButton: React.FC<{ onClick: () => void, isLoading: boolean, disabled: boolean, label: string }> = ({ onClick, isLoading, disabled, label }) => (
    <button
        onClick={onClick}
        disabled={disabled || isLoading}
        style={{
            padding: '10px 16px',
            backgroundColor: disabled ? '#E5E7EB' : 'var(--color-brand)',
            color: disabled ? '#9CA3AF' : 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 500,
            cursor: disabled ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.2s',
            minWidth: '130px',
            justifyContent: 'center'
        }}
    >
        {isLoading ? (
            <>
                <Loader2 size={16} className="animate-spin" /> Generiere...
            </>
        ) : (
            <>
                <Download size={16} /> {label}
            </>
        )}
    </button>
);

export default OutputView;
