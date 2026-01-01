import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, School, BookOpen, AlertCircle, CheckCircle, Mail, Phone, FileText } from 'lucide-react';
import type { JobListing, JobApplication } from '../../types/marketplace';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../services/marketplace';

interface JobDetailModalProps {
    job: JobListing;
    onClose: () => void;
    onApply: (job: JobListing) => void;
    onJobUpdate?: (jobId: string, updates: Partial<JobListing>) => void;
}

const JobDetailModal = ({ job, onClose, onJobUpdate }: JobDetailModalProps) => {
    const { currentUser, userProfile } = useAuth();
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [error, setError] = useState('');

    // School Rep Review State
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [isLoadingApps, setIsLoadingApps] = useState(false);
    const [showApplicants, setShowApplicants] = useState(false);

    // Only show owner controls if they are currently in school_rep mode
    const isJobOwner = currentUser?.uid === job.userId && userProfile?.role === 'school_rep';

    useEffect(() => {
        if (isJobOwner) {
            const loadApps = async () => {
                setIsLoadingApps(true);
                const apps = await marketplaceService.getApplicationsForJob(job.id!);
                setApplications(apps);
                setIsLoadingApps(false);
            };
            loadApps();
        }
    }, [job.id, isJobOwner]);

    const handleStatusUpdate = async (appId: string, status: 'accepted' | 'rejected') => {
        try {
            await marketplaceService.updateApplicationStatus(appId, status);

            // If accepted, close the job
            if (status === 'accepted' && job.id) {
                await marketplaceService.updateJob(job.id, { status: 'filled' } as const);
                if (onJobUpdate) {
                    onJobUpdate(job.id, { status: 'filled' });
                }
            }

            // Optimistic update
            setApplications(prev => prev.map(a =>
                a.id === appId ? { ...a, status } : a
            ));
        } catch (e) {
            console.error("Failed to update status", e);
            alert("Fehler beim Aktualisieren des Status.");
        }
    };

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
                applicantEmail: currentUser.email || undefined,
                applicantPhone: userProfile?.phoneNumber,
                applicantCvUrl: userProfile?.cvUrl,
                message: message,
                // Snapshot data
                jobTitle: job.title || job.subject,
                jobLocation: job.location,
                jobDate: job.startDate
            });
            setHasApplied(true);
            onApply(job);
        } catch (err) {
            console.error(err);
            setError('Fehler beim Senden der Bewerbung.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check if user has already applied
    useEffect(() => {
        if (currentUser && !isJobOwner && userProfile?.role === 'teacher') {
            const checkApplication = async () => {
                const userApps = await marketplaceService.getApplicationsByUser(currentUser.uid);
                const applied = userApps.some(app => app.jobId === job.id);
                if (applied) {
                    setHasApplied(true);
                }
            };
            checkApplication();
        }
    }, [currentUser, job.id, isJobOwner, userProfile]);

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
                    {/* We can differentiate message if just checking existing vs newly applied, 
                        but for now reusing the success state is a simple way to block duplicate apply. 
                        Refining to show 'Bereits beworben' instead of 'Versendet!' if it was pre-existing would be better. */}
                    <h2>Bereits beworben</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                        Sie haben sich bereits auf diese Stelle beworben.
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
                    {isJobOwner ? (
                        <div style={{ padding: '8px 0' }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
                                backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '8px'
                            }}>
                                <span style={{ fontWeight: 600 }}>Eingegangene Bewerbungen</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span className="badge badge-primary" style={{ fontSize: '14px' }}>{applications.length}</span>
                                    {applications.length > 0 && (
                                        <button
                                            onClick={() => setShowApplicants(!showApplicants)}
                                            style={{
                                                fontSize: '13px', textDecoration: 'underline', color: 'var(--color-primary)',
                                                background: 'none', border: 'none', padding: 0, cursor: 'pointer'
                                            }}
                                        >
                                            {showApplicants ? 'Ausblenden' : 'Anzeigen'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isLoadingApps ? (
                                <p>Laden...</p>
                            ) : (
                                <>
                                    {showApplicants && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.2s' }}>
                                            {applications.map(app => (
                                                <div key={app.id} style={{
                                                    padding: '16px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--color-border)',
                                                    backgroundColor: '#f9fafb'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontWeight: 600 }}>{app.applicantName}</span>
                                                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                                            {new Date(app.appliedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    {app.message && (
                                                        <div style={{
                                                            fontSize: '14px',
                                                            padding: '8px',
                                                            backgroundColor: 'white',
                                                            borderRadius: '4px',
                                                            border: '1px solid #e5e7eb',
                                                            marginTop: '4px',
                                                            marginBottom: '12px',
                                                            fontStyle: 'italic',
                                                            color: '#4b5563'
                                                        }}>
                                                            "{app.message}"
                                                        </div>
                                                    )}

                                                    <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '12px', fontSize: '13px' }}>
                                                        <div style={{ fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Kontaktdaten (Privat):</div>
                                                        <div style={{ display: 'grid', gap: '4px', color: '#4b5563' }}>
                                                            {app.applicantEmail && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <Mail size={14} />
                                                                    <a href={`mailto:${app.applicantEmail}`} style={{ textDecoration: 'none', color: 'inherit' }}>{app.applicantEmail}</a>
                                                                </div>
                                                            )}
                                                            {app.applicantPhone && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <Phone size={14} />
                                                                    <a href={`tel:${app.applicantPhone}`} style={{ textDecoration: 'none', color: 'inherit' }}>{app.applicantPhone}</a>
                                                                </div>
                                                            )}
                                                            {app.applicantCvUrl && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <FileText size={14} />
                                                                    <a href={app.applicantCvUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Lebenslauf ansehen</a>
                                                                </div>
                                                            )}
                                                            {!app.applicantEmail && !app.applicantPhone && !app.applicantCvUrl && (
                                                                <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>Keine Kontaktdaten freigegeben.</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                                        {app.status === 'pending' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(app.id!, 'rejected')}
                                                                    style={{
                                                                        padding: '6px 12px', fontSize: '13px',
                                                                        backgroundColor: 'white', border: '1px solid #fee2e2', color: '#dc2626',
                                                                        borderRadius: '6px'
                                                                    }}
                                                                >
                                                                    Ablehnen
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(app.id!, 'accepted')}
                                                                    style={{
                                                                        padding: '6px 12px', fontSize: '13px',
                                                                        backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534',
                                                                        borderRadius: '6px', fontWeight: 600
                                                                    }}
                                                                >
                                                                    Akzeptieren
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span style={{
                                                                padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                                                                backgroundColor: app.status === 'accepted' ? '#dcfce7' : '#fee2e2',
                                                                color: app.status === 'accepted' ? '#166534' : '#991b1b'
                                                            }}>
                                                                {app.status === 'accepted' ? 'Akzeptiert' : 'Abgelehnt'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!showApplicants && applications.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                                            Noch keine Bewerbungen.
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : userProfile?.role === 'school_rep' ? (
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
