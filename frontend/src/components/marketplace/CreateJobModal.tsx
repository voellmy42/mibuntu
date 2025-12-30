import React, { useState } from 'react';
import { marketplaceService } from '../../services/marketplace';
import type { JobListing } from '../../types/marketplace';

interface CreateJobModalProps {
    onClose: () => void;
    onJobCreated: () => void;
}

const CreateJobModal: React.FC<CreateJobModalProps> = ({ onClose, onJobCreated }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        school: '',
        location: '',
        startDate: '',
        endDate: '',
        days: '',
        pay: '',
        description: '',
        formattedStartDate: '', // For date input
        formattedEndDate: '',   // For date input
        urgent: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Construct the Job object
            const newJob: Omit<JobListing, 'id' | 'createdAt'> = {
                userId: 'demo_user_123', // Hardcoded for demo
                subject: formData.subject,
                school: formData.school || 'Unbekannte Schule',
                location: formData.location,
                startDate: formData.startDate,
                endDate: formData.endDate,
                days: formData.days,
                pay: formData.pay,
                urgent: formData.urgent,
                description: formData.description,
                imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' // default image
            };

            await marketplaceService.createJob(newJob);
            onJobCreated();
            onClose();
        } catch (error) {
            console.error("Failed to create job", error);
            alert("Fehler beim Erstellen des Inserats.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
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
            <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: 'var(--shadow-xl)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer'
                    }}
                >
                    &times;
                </button>

                <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 700 }}>Neues Inserat aufgeben</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Fach / Titel</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="z.B. Primarschule 3. Klasse"
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Schule</label>
                        <input
                            type="text"
                            name="school"
                            value={formData.school}
                            onChange={handleChange}
                            placeholder="z.B. Schule Feldmeilen"
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ort</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="z.B. Meilen, ZH"
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Zeitraum</label>
                            <input
                                type="text"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                placeholder="12. März - 15. März"
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Pensum / Tage</label>
                            <input
                                type="text"
                                name="days"
                                value={formData.days}
                                onChange={handleChange}
                                placeholder="3 Tage / 40%"
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Lohn</label>
                        <input
                            type="text"
                            name="pay"
                            value={formData.pay}
                            onChange={handleChange}
                            placeholder="z.B. CHF 140.- / Lektion"
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                            type="checkbox"
                            name="urgent"
                            checked={formData.urgent}
                            onChange={handleCheckboxChange}
                            id="urgent-check"
                            style={{ width: '20px', height: '20px' }}
                        />
                        <label htmlFor="urgent-check" style={{ fontWeight: 600 }}>Dringend?</label>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ marginTop: '16px', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Wird erstellt...' : 'Inserat veröffentlichen'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default CreateJobModal;
