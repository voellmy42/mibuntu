import { useState } from 'react';
import { X, Calendar, MapPin, School, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import type { JobListing } from '../../types/marketplace';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../services/marketplace';

interface JobDetailModalProps {
    job: JobListing;
    onClose: () => void;
    onApply: (job: JobListing) => void;
}

const JobDetailModal = ({ job, onClose }: JobDetailModalProps) => {
    const { currentUser, userProfile } = useAuth();
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [error, setError] = useState('');

    const handleApplyClick = async () => {
        if (!currentUser) {
            alert("Bitte melden Sie sich an, um sich zu bewerben.");
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await marketplaceService.applyToJob({
                jobId: job.id!,
                applicantId: currentUser.uid,
                applicantName: currentUser.displayName || 'Unbekannt',
                message: message,
                // Snapshot data
                jobTitle: job.title || job.subject,
                jobLocation: job.location,
                jobDate: job.startDate
            });
            setHasApplied(true);
        } catch (err) {
            console.error(err);
            setError('Fehler beim Senden der Bewerbung.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hasApplied) {
        return (
            <div className="modal-overlay" onClick={onClose} style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
            }}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                    textAlign: 'center',
                    padding: '60px 40px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '600px',
                    boxShadow: 'var(--shadow-xl)'
                }}>
                    <div style={{ color: 'green', marginBottom: '20px' }}>
                        <CheckCircle size={64} />
                    </div>
                    <h2>Bewerbung versendet!</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                        Die Schule wurde benachrichtigt und wird sich bei Ihnen melden.
                    </p>
                    <button className="btn-primary" onClick={onClose}>
                        Zurück zur Übersicht
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                maxWidth: '700px',
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '16px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: 'var(--shadow-xl)'
            }}>
                <button className="modal-close" onClick={onClose} style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer'
                }}>
                    <X size={24} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <span className="badge badge-primary">{job.subject}</span>
                        <span className="badge badge-secondary">{job.cycle}</span>
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
                    <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>{job.title || job.subject}</h2>
                    <div style={{ display: 'flex', gap: '24px', color: 'var(--color-text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <School size={18} />
                            <span>{job.school || 'Schule'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={18} />
                            <span>{job.location} ({job.canton})</span>
                        </div>
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#f9fafb',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                }}>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>ZEITRAUM</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                            <Calendar size={18} />
                            {job.startDate} {job.endDate ? `- ${job.endDate}` : ''}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>PENSUM / TAGE</div>
                        <div style={{ fontWeight: 500 }}>
                            {job.daysOfWeek.join(', ')} ({job.pay || '100%'})
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={20} />
                        Beschreibung
                    </h3>
                    <p style={{ lineHeight: '1.6', color: 'var(--color-text-primary)' }}>
                        {job.description || "Keine Beschreibung verfügbar."}
                    </p>
                </div>

                {/* Application Section */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                    {userProfile?.role === 'school_rep' ? (
                        <div style={{
                            padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px',
                            display: 'flex', gap: '12px', alignItems: 'center'
                        }}>
                            <AlertCircle size={20} color="var(--color-text-secondary)" />
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                                Als Schulvertreter können Sie sich nicht bewerben.
                            </span>
                        </div>
                    ) : (
                        <>
                            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Bewerbung</h3>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                    Nachricht an die Schulleitung (Optional)
                                </label>
                                <textarea
                                    className="form-input"
                                    placeholder="Warum passen Sie auf diese Stelle?"
                                    style={{ minHeight: '100px' }}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button className="btn-secondary" onClick={onClose}>
                                    Abbrechen
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handleApplyClick}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Sende...' : 'Jetzt bewerben'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDetailModal;
