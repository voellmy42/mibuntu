import React from 'react';
import OutputView from './OutputView';
import { X } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGeneratePdf: () => void;
    onGenerateWord: () => void;
    onGeneratePpt: () => void;
    isGeneratingPdf: boolean;
    isGeneratingWord: boolean;
    isGeneratingPpt: boolean;
    hasContent: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({
    isOpen,
    onClose,
    ...outputProps
}) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
            <div style={{
                background: 'white', borderRadius: '16px',
                width: '100%', maxWidth: '500px', maxHeight: '90vh',
                position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '16px', right: '16px',
                    background: 'none', border: 'none', cursor: 'pointer', zIndex: 10
                }}>
                    <X size={24} color="#6B7280" />
                </button>
                <OutputView {...outputProps} />
            </div>
        </div>
    );
};

export default ExportModal;
