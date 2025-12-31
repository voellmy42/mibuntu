import { useRef, useEffect } from 'react';
import type { JobListing } from '../../types/marketplace';

interface JobDetailModalProps {
    job: JobListing;
    onClose: () => void;
    onApply: (job: JobListing) => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose, onApply }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '16px'
        }}>
            <div ref={modalRef} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '600px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh',
                position: 'relative'
            }}>
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{job.title || job.subject}</h2>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '24px',
                                color: 'var(--color-text-secondary)',
                                padding: '4px'
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                            backgroundColor: '#f3f4f6',
                            color: 'var(--color-text-secondary)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: 600
                        }}>
                            {job.subject}
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>•</span>
                        <span style={{ fontSize: '16px', fontWeight: 500 }}>{job.school}</span>
                        {job.urgent && (
                            <span style={{
                                backgroundColor: '#fee2e2', color: '#dc2626',
                                padding: '4px 8px', borderRadius: '4px',
                                fontSize: '12px', fontWeight: 700, textTransform: 'uppercase'
                            }}>
                                Dringend
                            </span>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Ort</label>
                            <div style={{ fontWeight: 600 }}>{job.location} {job.canton ? `(${job.canton})` : ''}</div>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Stufe / Zyklus</label>
                            <div style={{ fontWeight: 600 }}>{job.cycle}</div>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Zeitraum</label>
                            <div style={{ fontWeight: 600 }}>{job.startDate} {job.endDate && `- ${job.endDate}`}</div>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Wochentage</label>
                            <div style={{ fontWeight: 600 }}>{job.daysOfWeek?.join(', ')}</div>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Vergütung</label>
                            <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{job.pay} / Lektion</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Beschreibung</label>
                        <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {job.description || "Keine Beschreibung verfügbar."}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 20px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'white',
                            color: 'var(--color-text-primary)',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Schliessen
                    </button>
                    <button
                        onClick={() => onApply(job)}
                        className="btn-primary"
                        style={{ padding: '12px 20px' }}
                    >
                        Interesse Anmelden
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobDetailModal;
