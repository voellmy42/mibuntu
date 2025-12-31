import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { GraduationCap, School, Check, ChevronRight } from 'lucide-react';
import { SWISS_CANTONS, SCHOOL_LEVELS, SUBJECTS_LP21 } from '../data/common';

import '../styles/Onboarding.css';

const Onboarding: React.FC = () => {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();

    // State
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedRole, setSelectedRole] = useState<'teacher' | 'school_rep' | null>(null);
    const [saving, setSaving] = useState(false);

    // Form Data
    const [canton, setCanton] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [schoolName, setSchoolName] = useState('');
    const [levels, setLevels] = useState<string[]>([]);
    const [bio, setBio] = useState('');

    useEffect(() => {
        if (userProfile?.role && step === 1 && !saving) {
            navigate('/planner');
        }
    }, [userProfile, navigate, step, saving]);

    const handleRoleSelect = (role: 'teacher' | 'school_rep') => {
        setSelectedRole(role);
        setStep(2);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !selectedRole) return;

        setSaving(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);

            const profileData: any = {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                role: selectedRole,
                canton: canton,
                updatedAt: serverTimestamp(),
            };

            if (selectedRole === 'teacher') {
                profileData.subjects = selectedSubjects;
                profileData.levels = levels;
                profileData.bio = bio;
            } else if (selectedRole === 'school_rep') {
                profileData.schoolName = schoolName;
            }

            if (!userProfile?.createdAt) {
                profileData.createdAt = serverTimestamp();
            }

            await setDoc(userRef, profileData, { merge: true });
            await refreshProfile();
            navigate('/planner');
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Fehler beim Speichern des Profils. Bitte versuchen Sie es erneut.");
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

    // UI Components
    const RoleCard = ({ role, icon: Icon, title, desc }: any) => (
        <div
            onClick={() => handleRoleSelect(role)}
            className={`role-card ${selectedRole === role ? 'selected' : ''}`}
        >
            <div className="role-icon-wrapper">
                <Icon size={40} />
            </div>
            <div>
                <h3 className="role-title">{title}</h3>
                <p className="role-desc">
                    {desc}
                </p>
            </div>
        </div>
    );

    return (
        <div className="onboarding-container">
            <div className="onboarding-content">
                <div className="onboarding-header">
                    <h1 className="onboarding-title">
                        {step === 1 ? "Willkommen bei Mibuntu" : "Profil vervollständigen"}
                    </h1>
                    <p className="onboarding-subtitle">
                        {step === 1
                            ? "Wählen Sie Ihre Rolle, um die Erfahrung zu personalisieren."
                            : "Erzählen Sie uns ein wenig mehr über sich."}
                    </p>
                </div>

                {/* Steps Indicator */}
                <div className="steps-indicator">
                    <div className={`step-dot ${step === 1 ? 'active' : 'completed'}`} />
                    <div className={`step-dot ${step === 2 ? 'active' : ''}`} />
                </div>

                {step === 1 ? (
                    <div className="role-grid">
                        <RoleCard
                            role="teacher"
                            icon={GraduationCap}
                            title="Lehrperson"
                            desc="Ich möchte Unterricht mit KI planen und passende Stellvertretungen finden."
                        />
                        <RoleCard
                            role="school_rep"
                            icon={School}
                            title="Schulleitung / Admin"
                            desc="Ich verwalte Stellvertretungs-Inserate und suche nach qualifizierten Lehrpersonen."
                        />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="onboarding-form">
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

                        {selectedRole === 'teacher' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Fächer (Mehrfachauswahl möglich)</label>
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
                                    <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                        Ausgewählt: {selectedSubjects.length > 0 ? selectedSubjects.join(', ') : 'Keine'}
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
                                    <label className="form-label">Über mich (Optional)</label>
                                    <textarea
                                        placeholder="Erzählen Sie kurz etwas über Ihre Erfahrung und Motivation..."
                                        className="form-input"
                                        style={{ minHeight: '100px', resize: 'vertical' }}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {selectedRole === 'school_rep' && (
                            <div className="form-group">
                                <label className="form-label">Schulname</label>
                                <input
                                    type="text"
                                    placeholder="Name der Schule"
                                    className="form-input"
                                    value={schoolName}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="btn-back"
                            >
                                Zurück
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-submit"
                            >
                                {saving ? 'Speichert...' : 'Profil erstellen'}
                                {!saving && <ChevronRight size={20} />}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
