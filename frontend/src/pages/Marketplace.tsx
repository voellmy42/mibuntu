import { useState, useEffect } from 'react';
import { marketplaceService } from '../services/marketplace';
import type { JobListing } from '../types/marketplace';
import CreateJobModal from '../components/marketplace/CreateJobModal';

const Marketplace = () => {
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
        // Placeholder for application logic
        alert(`Bewerbung für ${job.subject} würde hier starten.`);
    };

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            {/* Header / Filter */}
            <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '8px' }}>Offene Stellvertretungen</h1>
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

            {/* Modern Filter Bar Mockup */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
                {['Alle Fächer', 'Primarschule', 'Sekundarstufe', 'Gymnasium', 'Dringend'].map((filter, i) => (
                    <button key={i} style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        border: i === 0 ? '2px solid var(--color-text-primary)' : '1px solid var(--color-border)',
                        backgroundColor: i === 0 ? 'var(--color-text-primary)' : 'white',
                        color: i === 0 ? 'white' : 'var(--color-text-primary)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                    }}>
                        {filter}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {isLoading ? (
                <div>Laden...</div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px'
                }}>
                    {jobs.map(job => (
                        <div key={job.id} style={{
                            cursor: 'pointer',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            transition: 'transform 0.2s',
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            onClick={() => handleApply(job)}
                        >
                            {/* Image area */}
                            <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                                <img
                                    src={job.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                                    alt={job.subject}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    backgroundColor: 'white',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    {job.days}
                                </div>
                                {job.urgent && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        left: '12px',
                                        backgroundColor: '#E61E2A',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        fontWeight: 700,
                                        fontSize: '10px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Dringend
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ paddingTop: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{job.location}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600 }}>4.8</span>
                                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>★</span>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginBottom: '4px' }}>
                                    {job.subject}
                                </p>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginBottom: '8px' }}>
                                    {job.startDate} {job.endDate ? `- ${job.endDate}` : ''}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '16px' }}>{job.pay}</span>
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
        </div>
    );
};

export default Marketplace;
