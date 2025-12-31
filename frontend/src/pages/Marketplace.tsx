import { useState, useEffect } from 'react';
import { marketplaceService } from '../services/marketplace';
import type { JobListing } from '../types/marketplace';
import CreateJobModal from '../components/marketplace/CreateJobModal';
import JobDetailModal from '../components/marketplace/JobDetailModal';
import { SUBJECTS, CYCLES, CANTONS } from '../data/constants';
import { SWISS_LOCATIONS } from '../data/swiss_locations';

const Marketplace = () => {
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const [filters, setFilters] = useState({
        subject: '',
        cycle: '',
        canton: ''
    });

    const fetchJobs = async () => {
        setIsLoading(true);
        const data = await marketplaceService.getJobs();
        setJobs(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleApply = (job: JobListing) => {
        alert(`Bewerbung für ${job.subject} würde hier starten.`);
        setSelectedJob(null); // Close modal after applying
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredJobs = jobs.filter(job => {
        let matches = true;
        if (filters.subject && filters.subject !== 'Alle Fächer' && job.subject !== filters.subject) matches = false;
        if (filters.cycle && job.cycle !== filters.cycle) matches = false; // Simple cycle match
        if (filters.canton) {
            let jobCanton = job.canton;
            // Legacy fallback: If no canton is set, try to infer it from the location string
            if (!jobCanton && job.location) {
                const found = SWISS_LOCATIONS.find(l =>
                    job.location.includes(l.zip) ||
                    (l.city.length > 3 && job.location.toLowerCase().includes(l.city.toLowerCase()))
                );
                if (found) {
                    jobCanton = found.canton;
                }
            }
            if (jobCanton !== filters.canton) matches = false;
        }
        return matches;
    });

    return (
        <div className="container" style={{ paddingBottom: '80px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ padding: '40px 0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '8px', fontSize: '28px' }}>Offene Stellvertretungen</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Finde den passenden Einsatz in deiner Nähe.</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ padding: '12px 20px' }}
                    onClick={() => setShowCreateModal(true)}
                >
                    Inserat aufgeben
                </button>
            </div>

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

            {/* Job List (Compact) */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Laden...</div>
            ) : filteredJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>Keine passenden Inserate gefunden.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredJobs.map(job => (
                        <div key={job.id}
                            onClick={() => setSelectedJob(job)}
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
                                        fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                                        marginLeft: '8px',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Dringend
                                    </span>
                                )}
                            </div>

                            <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{
                                    backgroundColor: '#f3f4f6',
                                    color: 'var(--color-text-secondary)',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: 500
                                }}>
                                    {job.subject}
                                </span>
                                <span style={{
                                    backgroundColor: '#f3f4f6',
                                    color: 'var(--color-text-secondary)',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: 500
                                }}>
                                    {job.cycle}
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '24px',
                                color: 'var(--color-text-secondary)',
                                fontSize: '15px',
                                borderTop: '1px solid var(--color-border)',
                                paddingTop: '16px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '16px' }}>📍</span>
                                    <span>{job.location} {job.canton ? `(${job.canton})` : ''}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '16px' }}>🗓️</span>
                                    <span>{job.startDate} {job.endDate ? `- ${job.endDate}` : ''}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateJobModal
                    onClose={() => setShowCreateModal(false)}
                    onJobCreated={fetchJobs}
                />
            )}

            {selectedJob && (
                <JobDetailModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    onApply={handleApply}
                />
            )}
        </div>
    );
};

export default Marketplace;
