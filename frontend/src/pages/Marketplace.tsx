import { useState, useEffect, useCallback } from 'react';
import { marketplaceService } from '../services/marketplace';
import type { JobListing, JobApplication } from '../types/marketplace';
import CreateJobModal from '../components/marketplace/CreateJobModal';
import JobDetailModal from '../components/marketplace/JobDetailModal';
import { SUBJECTS, CYCLES, CANTONS } from '../data/constants';
import { SWISS_LOCATIONS } from '../data/swiss_locations';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Calendar, MapPin, Inbox, Search, PlusCircle } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

const Marketplace = () => {
    const { currentUser, userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'search' | 'dashboard'>('search');

    // Data State
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
    const [myPostedJobs, setMyPostedJobs] = useState<JobListing[]>([]);
    const [applicationsMap, setApplicationsMap] = useState<Record<string, JobApplication[]>>({});

    // UI State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const [filters, setFilters] = useState({
        subject: '',
        cycle: '',
        canton: ''
    });

    const fetchJobs = useCallback(async () => {
        setIsLoading(true);
        const data = await marketplaceService.getJobs();
        setJobs(data);
        setIsLoading(false);
    }, []);

    const fetchDashboardData = useCallback(async () => {
        if (!currentUser) return;

        if (userProfile?.role === 'teacher') {
            const apps = await marketplaceService.getApplicationsByUser(currentUser.uid);
            setMyApplications(apps);
        } else if (userProfile?.role === 'school_rep') {
            const posted = await marketplaceService.getJobsByUser(currentUser.uid);
            setMyPostedJobs(posted);

            // Fetch applications for all jobs
            const appsMap: Record<string, JobApplication[]> = {};
            for (const job of posted) {
                if (job.id) {
                    const jobApps = await marketplaceService.getApplicationsForJob(job.id);
                    appsMap[job.id] = jobApps;
                }
            }
            setApplicationsMap(appsMap);
        }
    }, [currentUser, userProfile]);

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (activeTab === 'search') {
            fetchJobs();
        } else {
            fetchDashboardData();
        }
    }, [activeTab, fetchJobs, fetchDashboardData]);

    const { sendNotification } = useNotifications();

    // Apply Handler (Passed to Modal)
    const handleApply = async (job: JobListing) => {
        // Triggered after successful application in Modal

        if (job.userId) {
            await sendNotification(job.userId, {
                type: 'new_application',
                title: 'Neue Bewerbung',
                message: `${userProfile?.displayName || 'Ein Nutzer'} hat sich auf "${job.title || job.subject}" beworben.`,
                link: '/marketplace', // Or specific link if we had routing to specific job mgmt
                metadata: { jobId: job.id }
            });
        } else {
            console.warn('Job missing userId, cannot send notification');
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredJobs = jobs.filter(job => {
        let matches = true;
        if (filters.subject && filters.subject !== 'Alle Fächer' && job.subject !== filters.subject) matches = false;
        if (filters.cycle && job.cycle !== filters.cycle) matches = false;
        if (filters.canton) {
            let jobCanton = job.canton;
            if (!jobCanton && job.location) {
                const found = SWISS_LOCATIONS.find(l =>
                    job.location.includes(l.zip) ||
                    (l.city.length > 3 && job.location.toLowerCase().includes(l.city.toLowerCase()))
                );
                if (found) jobCanton = found.canton;
            }
            if (jobCanton !== filters.canton) matches = false;
        }

        // Filter out filled jobs from search
        if (job.status === 'filled') matches = false;

        return matches;
    });

    return (
        <div className="container" style={{ paddingBottom: '80px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ padding: '40px 0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '8px', fontSize: '28px' }}>Marktplatz</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        {activeTab === 'search' ? 'Finde den passenden Einsatz in deiner Nähe.' : 'Verwalte deine Inserate und Bewerbungen.'}
                    </p>
                </div>
                {userProfile?.role === 'school_rep' && (
                    <button
                        className="btn-primary"
                        style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => setShowCreateModal(true)}
                    >
                        + Inserat aufgeben
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--color-border)', marginBottom: '32px' }}>
                <button
                    onClick={() => setActiveTab('search')}
                    style={{
                        padding: '12px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'search' ? '2px solid var(--color-brand)' : '2px solid transparent',
                        color: activeTab === 'search' ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Stellensuche
                </button>
                {currentUser && (
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        style={{
                            padding: '12px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'dashboard' ? '2px solid var(--color-brand)' : '2px solid transparent',
                            color: activeTab === 'dashboard' ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Mein Bereich
                    </button>
                )}
            </div>

            {/* Content: Search */}
            {activeTab === 'search' && (
                <>
                    {/* Filter Bar */}
                    <div className="filter-grid" style={{
                        marginBottom: '32px',
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Fachbereich</label>
                            <select
                                name="subject"
                                value={filters.subject}
                                onChange={handleFilterChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'white' }}
                            >
                                <option value="">Alle Fächer</option>
                                {SUBJECTS.filter(s => s !== 'Alle Fächer').map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Stufe / Zyklus</label>
                            <select
                                name="cycle"
                                value={filters.cycle}
                                onChange={handleFilterChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'white' }}
                            >
                                <option value="">Alle Stufen</option>
                                {CYCLES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Kanton</label>
                            <select
                                name="canton"
                                value={filters.canton}
                                onChange={handleFilterChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'white' }}
                            >
                                <option value="">Alle Kantone</option>
                                {CANTONS.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Job List */}
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>Laden...</div>
                    ) : filteredJobs.length === 0 ? (
                        <EmptyState
                            icon={Search}
                            title="Keine Inserate gefunden"
                            description={
                                filters.subject || filters.canton || filters.cycle
                                    ? "Versuchen Sie, Ihre Filterkriterien anzupassen, um mehr Ergebnisse zu sehen."
                                    : "Momentan sind keine passenden Stellvertretungen verfügbar. Schauen Sie später wieder vorbei."
                            }
                            action={{
                                label: "Filter zurücksetzen",
                                onClick: () => setFilters({ subject: '', cycle: '', canton: '' })
                            }}
                        />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filteredJobs.map(job => (
                                <div key={job.id}
                                    onClick={() => setSelectedJob(job)}
                                    className="job-card" // Assuming CSS class exists or inline below
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        border: '1px solid var(--color-border)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: 'var(--shadow-sm)',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                        e.currentTarget.style.borderColor = 'var(--color-border)';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                            {job.title || job.subject}
                                        </h3>
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
                                    <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <span className="badge badge-primary">{job.subject}</span>
                                        <span className="badge badge-secondary">{job.cycle}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '24px', color: 'var(--color-text-secondary)', fontSize: '15px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <MapPin size={16} />
                                            <span>{job.location}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={16} />
                                            <span>{job.startDate}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Content: Dashboard */}
            {activeTab === 'dashboard' && (
                <div>
                    {/* Teacher Dashboard */}
                    {userProfile?.role === 'teacher' && (
                        <div>
                            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Meine Bewerbungen</h2>
                            {myApplications.length === 0 ? (
                                <EmptyState
                                    icon={Inbox}
                                    title="Noch keine Bewerbungen"
                                    description="Starten Sie Ihre Suche im Marktplatz und bewerben Sie sich auf interessante Stellen."
                                    action={{
                                        label: "Zum Marktplatz",
                                        onClick: () => setActiveTab('search')
                                    }}
                                />
                            ) : (
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {myApplications.map(app => (
                                        <div key={app.id} style={{
                                            backgroundColor: 'white', padding: '24px', borderRadius: '12px',
                                            border: '1px solid var(--color-border)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{app.jobTitle || 'Stellvertretung'}</h3>
                                                <div style={{ color: 'var(--color-text-secondary)', display: 'flex', gap: '16px', fontSize: '14px' }}>
                                                    <span>{app.jobLocation}</span>
                                                    <span>{app.jobDate}</span>
                                                </div>
                                                {app.message && <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>"{app.message}"</p>}
                                            </div>
                                            <div>
                                                <span style={{
                                                    padding: '6px 12px', borderRadius: '99px', fontSize: '14px', fontWeight: 600,
                                                    backgroundColor: app.status === 'accepted' ? '#dcfce7' : app.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                                                    color: app.status === 'accepted' ? '#166534' : app.status === 'rejected' ? '#991b1b' : '#4b5563'
                                                }}>
                                                    {app.status === 'pending' ? 'Ausstehend' : app.status === 'accepted' ? 'Akzeptiert' : 'Abgelehnt'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* School Dashboard */}
                    {userProfile?.role === 'school_rep' && (
                        <div>
                            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Meine Inserate</h2>
                            {myPostedJobs.length === 0 ? (
                                <EmptyState
                                    icon={PlusCircle}
                                    title="Keine Inserate aufgegeben"
                                    description="Erstellen Sie Ihr erstes Inserat, um qualifizierte Stellvertretungen zu finden."
                                    action={{
                                        label: "Inserat aufgeben",
                                        onClick: () => setShowCreateModal(true)
                                    }}
                                />
                            ) : (
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {myPostedJobs.map(job => (
                                        <div key={job.id} style={{
                                            backgroundColor: 'white', padding: '24px', borderRadius: '12px',
                                            border: '1px solid var(--color-border)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                                <div>
                                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{job.title || job.subject}</h3>
                                                    <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Erstellt am {new Date(job.createdAt).toLocaleDateString()}</span>
                                                    {job.status === 'filled' && (
                                                        <span style={{
                                                            marginLeft: '8px', backgroundColor: '#dcfce7', color: '#166534',
                                                            padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700
                                                        }}>
                                                            BESETZT
                                                        </span>
                                                    )}
                                                </div>
                                                <button className="btn-secondary" style={{ fontSize: '14px', padding: '6px 12px' }}>
                                                    Bearbeiten
                                                </button>
                                            </div>

                                            {/* Applications Preview */}
                                            <div style={{
                                                marginTop: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px',
                                                border: '1px solid var(--color-border)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: applicationsMap[job.id!]?.length > 0 ? '12px' : 0 }}>
                                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>
                                                        Bewerbungen ({applicationsMap[job.id!]?.length || 0})
                                                    </span>
                                                    <button
                                                        onClick={() => setSelectedJob(job)}
                                                        style={{
                                                            color: '#646cff', fontWeight: 600, background: 'none', border: 'none',
                                                            cursor: 'pointer', padding: 0, fontSize: '13px'
                                                        }}
                                                    >
                                                        Details & Bewerber ansehen →
                                                    </button>
                                                </div>

                                                {applicationsMap[job.id!]?.length > 0 && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        {applicationsMap[job.id!].map(app => (
                                                            <div key={app.id} style={{
                                                                backgroundColor: 'white', padding: '10px', borderRadius: '6px',
                                                                border: '1px solid var(--color-border)',
                                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                                fontSize: '13px'
                                                            }}>
                                                                <span style={{ fontWeight: 500 }}>{app.applicantName}</span>
                                                                <span style={{
                                                                    padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                                                                    backgroundColor: app.status === 'accepted' ? '#dcfce7' : app.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                                                                    color: app.status === 'accepted' ? '#166534' : app.status === 'rejected' ? '#991b1b' : '#4b5563'
                                                                }}>
                                                                    {app.status === 'pending' ? 'Ausstehend' : app.status === 'accepted' ? 'Akzeptiert' : 'Abgelehnt'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {showCreateModal && (
                <CreateJobModal
                    onClose={() => setShowCreateModal(false)}
                    onJobCreated={() => {
                        setShowCreateModal(false);
                        fetchJobs(); // Refresh search list
                        if (activeTab === 'dashboard') fetchDashboardData();
                    }}
                />
            )}

            {selectedJob && (
                <JobDetailModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    onApply={handleApply}
                    onJobUpdate={(jobId, updates) => {
                        // Update in search list (will be filtered out if filled)
                        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...updates } : j));

                        // Update in my posted jobs
                        setMyPostedJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...updates } : j));

                        // If specifically filled, we might want to close modal or show success? 
                        // For now just keeping it simple.
                    }}
                />
            )}
        </div>
    );
};

export default Marketplace;
