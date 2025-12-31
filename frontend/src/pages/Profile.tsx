import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Save, User as UserIcon } from 'lucide-react';
import { SWISS_CANTONS, SCHOOL_LEVELS, SUBJECTS_LP21 } from '../data/common';
import '../styles/Onboarding.css'; // Reuse onboarding styles

const Profile: React.FC = () => {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Form Data
    const [canton, setCanton] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [schoolName, setSchoolName] = useState('');
    const [levels, setLevels] = useState<string[]>([]);
    const [bio, setBio] = useState('');

    useEffect(() => {
        if (userProfile) {
            setCanton(userProfile.canton || '');
            setSelectedSubjects(userProfile.subjects || []);
            setSchoolName(userProfile.schoolName || '');
            setLevels(userProfile.levels || []);
            setBio(userProfile.bio || '');
        }
    }, [userProfile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setSaving(true);
        setSuccessMsg('');

        try {
            const userRef = doc(db, 'users', currentUser.uid);

            const updates: any = {
                canton,
                updatedAt: serverTimestamp(),
            };

            if (userProfile?.role === 'teacher') {
                updates.subjects = selectedSubjects;
                updates.levels = levels;
                updates.bio = bio;
            } else if (userProfile?.role === 'school_rep') {
                updates.schoolName = schoolName;
            }

            await updateDoc(userRef, updates);
            await refreshProfile();
            setSuccessMsg('Profil erfolgreich aktualisiert.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Fehler beim Speichern des Profils.");
        } finally {
            setSaving(false);
        }
    };

    const toggleLevel = (level: string) => {
        setLevels(prev =>
            prev.includes(level)
                ? prev.filter(l => l !== level)
                : [...prev, level]
        );
    };

    const toggleSubject = (subject: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subject)
                ? prev.filter(s => s !== subject)
                : [...prev, subject]
        );
    };

    if (!userProfile) return <div>Laden...</div>;

    return (
        <div className="container" style={{ paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ padding: '40px 0 24px' }}>
                <h1 style={{ marginBottom: '8px', fontSize: '28px' }}>Mein Profil</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Verwalten Sie Ihre persönlichen Daten und Einstellungen.</p>
            </div>

            <div className="onboarding-form" style={{ marginTop: 0 }}>
                {/* User Info Card */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '24px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    border: '1px solid var(--color-border)'
                }}>
                    {currentUser?.photoURL ? (
                        <img
                            src={currentUser.photoURL}
                            alt={currentUser.displayName || 'User'}
                            style={{ width: '64px', height: '64px', borderRadius: '50%' }}
                        />
                    ) : (
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            backgroundColor: 'var(--color-brand-light)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            <UserIcon size={32} color="var(--color-brand)" />
                        </div>
                    )}
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>{currentUser?.displayName}</h3>
                        <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}>
                            {currentUser?.email} •
                            <span style={{
                                marginLeft: '8px',
                                textTransform: 'capitalize',
                                backgroundColor: 'var(--color-brand)',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '99px',
                                fontSize: '12px'
                            }}>
                                {userProfile.role === 'school_rep' ? 'Schule' : 'Lehrperson'}
                            </span>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label className="form-label">Kanton</label>
                        <select
                            className="form-select"
                            value={canton}
                            onChange={(e) => setCanton(e.target.value)}
                            required
                        >
                            <option value="">Bitte wählen...</option>
                            {SWISS_CANTONS.map(c => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {userProfile.role === 'teacher' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Fächer</label>
                                <div className="level-pills">
                                    {SUBJECTS_LP21.map((subject) => (
                                        <button
                                            key={subject}
                                            type="button"
                                            onClick={() => toggleSubject(subject)}
                                            className={`level-pill ${selectedSubjects.includes(subject) ? 'active' : ''}`}
                                        >
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stufen</label>
                                <div className="level-pills">
                                    {SCHOOL_LEVELS.map((lvl) => (
                                        <button
                                            key={lvl}
                                            type="button"
                                            onClick={() => toggleLevel(lvl)}
                                            className={`level-pill ${levels.includes(lvl) ? 'active' : ''}`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Über mich</label>
                                <textarea
                                    className="form-input"
                                    style={{ minHeight: '120px', resize: 'vertical' }}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Beschreiben Sie Ihre Erfahrung..."
                                />
                            </div>
                        </>
                    )}

                    {userProfile.role === 'school_rep' && (
                        <div className="form-group">
                            <label className="form-label">Schulname</label>
                            <input
                                type="text"
                                className="form-input"
                                value={schoolName}
                                onChange={(e) => setSchoolName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
                        {successMsg && (
                            <span style={{ color: 'green', marginRight: '16px', fontWeight: 500 }}>
                                {successMsg}
                            </span>
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Save size={18} />
                            {saving ? 'Speichert...' : 'Speichern'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
