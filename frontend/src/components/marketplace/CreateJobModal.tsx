import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../services/marketplace';
import type { JobListing } from '../../types/marketplace';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

import { SWISS_LOCATIONS } from '../../data/swiss_locations';
import { SUBJECTS, CYCLES, DAYS_OF_WEEK, CANTONS } from '../../data/constants';

interface CreateJobModalProps {
    onClose: () => void;
    onJobCreated: () => void;
}

const CreateJobModal: React.FC<CreateJobModalProps> = ({ onClose, onJobCreated }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<typeof SWISS_LOCATIONS>([]);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        school: '',
        location: '',
        canton: '',
        cycle: '',
        daysOfWeek: [] as string[],
        pay: '',
        description: '',
        urgent: false
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleDayToggle = (day: string) => {
        setFormData(prev => {
            const days = prev.daysOfWeek.includes(day)
                ? prev.daysOfWeek.filter(d => d !== day)
                : [...prev.daysOfWeek, day];
            return { ...prev, daysOfWeek: days };
        });
    };

    const getFormattedDateRange = () => {
        if (!dateRange?.from) return '';
        if (!dateRange.to) return format(dateRange.from, 'dd.MM.yyyy', { locale: de });
        return `${format(dateRange.from, 'dd.MM.yyyy', { locale: de })} - ${format(dateRange.to, 'dd.MM.yyyy', { locale: de })} `;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!dateRange?.from) {
                alert("Bitte wählen Sie einen Zeitraum aus.");
                setLoading(false);
                return;
            }

            if (formData.daysOfWeek.length === 0) {
                alert("Bitte wählen Sie mindestens einen Wochentag aus.");
                setLoading(false);
                return;
            }

            // Construct the Job object
            const newJob: Omit<JobListing, 'id' | 'createdAt'> = {
                userId: currentUser?.uid || '',
                title: formData.title,
                canton: formData.canton,
                subject: formData.subject,
                school: formData.school || 'Unbekannte Schule',
                location: formData.location,
                startDate: format(dateRange.from, 'dd.MM.yyyy', { locale: de }),
                endDate: dateRange.to ? format(dateRange.to, 'dd.MM.yyyy', { locale: de }) : undefined,
                cycle: formData.cycle,
                daysOfWeek: formData.daysOfWeek,
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
                    {/* Title Input */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Titel des Inserats</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            maxLength={50}
                            placeholder="z.B. Vikariat Mathematik 8. Klasse"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--color-border)',
                                fontSize: '16px',
                                fontWeight: 500
                            }}
                        />
                        <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            {formData.title.length}/50
                        </div>
                    </div>

                    {/* Row: Canton & Subject */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Kanton</label>
                            <select
                                name="canton"
                                value={formData.canton}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'white', fontSize: '15px' }}
                            >
                                <option value="">Bitte wählen...</option>
                                {CANTONS.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Fachbereich</label>
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'white', fontSize: '15px' }}
                            >
                                <option value="">Bitte wählen...</option>
                                {SUBJECTS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Cycle & School */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Stufe / Zyklus</label>
                            <select
                                name="cycle"
                                value={formData.cycle}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'white', fontSize: '15px' }}
                            >
                                <option value="">Bitte wählen...</option>
                                {CYCLES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Schule</label>
                            <input
                                type="text"
                                name="school"
                                value={formData.school}
                                onChange={handleChange}
                                placeholder="Name der Schule"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                            />
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ort</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={(e) => {
                                handleChange(e);
                                const value = e.target.value.toLowerCase();
                                if (value.length > 1) {
                                    const filtered = SWISS_LOCATIONS.filter(l =>
                                        l.zip.includes(value) || l.city.toLowerCase().includes(value)
                                    ).slice(0, 5); // Limit to 5 suggestions
                                    setSuggestions(filtered);
                                } else {
                                    setSuggestions([]);
                                }
                            }}
                            onFocus={() => {
                                if (formData.location.length > 1) {
                                    const value = formData.location.toLowerCase();
                                    const filtered = SWISS_LOCATIONS.filter(l =>
                                        l.zip.includes(value) || l.city.toLowerCase().includes(value)
                                    ).slice(0, 5);
                                    setSuggestions(filtered);
                                }
                            }}
                            onBlur={() => {
                                // Delay hiding to allow click event to fire
                                setTimeout(() => setSuggestions([]), 200);
                            }}
                            placeholder="z.B. 8706 Meilen"
                            required
                            autoComplete="off"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                        />
                        {suggestions.length > 0 && (
                            <ul style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: 'white',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                marginTop: '4px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                padding: 0,
                                margin: 0,
                                listStyle: 'none',
                                zIndex: 1000,
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                {suggestions.map((loc) => (
                                    <li
                                        key={`${loc.zip}-${loc.city}`}
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                location: `${loc.zip} ${loc.city}`,
                                                canton: loc.canton || prev.canton
                                            }));
                                            setSuggestions([]);
                                        }}
                                        style={{
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--color-border)',
                                            color: 'black'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        {loc.zip} {loc.city}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div style={{ position: 'relative' }} ref={datePickerRef}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Zeitraum</label>
                        <input
                            type="text"
                            readOnly
                            value={getFormattedDateRange()}
                            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                            placeholder="Datum wählen"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                        />
                        {isDatePickerOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                zIndex: 10,
                                marginTop: '8px',
                                padding: '16px'
                            }}>
                                <DayPicker
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    locale={de}
                                    numberOfMonths={1}
                                    defaultMonth={new Date()}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Wochentage</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {DAYS_OF_WEEK.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDayToggle(day)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: formData.daysOfWeek.includes(day)
                                            ? '2px solid #646cff'
                                            : '1px solid var(--color-border)',
                                        backgroundColor: formData.daysOfWeek.includes(day)
                                            ? '#646cff'
                                            : 'white',
                                        color: formData.daysOfWeek.includes(day) ? 'white' : 'inherit',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        flex: 1
                                    }}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Lohnvorstellung</label>
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

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Beschreibung</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Details zur Stelle..."
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', minHeight: '100px', resize: 'vertical' }}
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
