import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { GraduationCap, School, ChevronRight, Sparkles, User, MapPin, BookOpen, Building } from 'lucide-react';
import { SWISS_CANTONS, SCHOOL_LEVELS, SUBJECTS_LP21 } from '../data/common';
import type { LucideIcon } from 'lucide-react';

import '../styles/Onboarding.css';

const Onboarding: React.FC = () => {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();

    // Steps: 0 = Welcome, 1 = Role, 2 = Details
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [selectedRole, setSelectedRole] = useState<'teacher' | 'school_rep' | null>(null);
    const [saving, setSaving] = useState(false);

    // Form Data
    const [canton, setCanton] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [schoolName, setSchoolName] = useState('');
    const [levels, setLevels] = useState<string[]>([]);
    const [bio, setBio] = useState('');

    useEffect(() => {
        // If user already has a role and we are not in the middle of saving/editing, redirect
        // But allow them to stay if they are consciously on this page (might need a check, but for now strict redirect is ok if profile is complete)
        if (userProfile?.role && step === 0 && !saving) {
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

            // Basic Profile Data
            const profileData: any = {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                role: selectedRole,
                canton: canton,
                updatedAt: serverTimestamp(),
            };

            // Role Specific Data
            if (selectedRole === 'teacher') {
                profileData.subjects = selectedSubjects;
                profileData.levels = levels;
                profileData.bio = bio;
            } else if (selectedRole === 'school_rep') {
                profileData.schoolName = schoolName;
            }

            // Create timestamp if new
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

    // --- Sub-Components ---

    const WelcomeStep = () => (
        <div className="onboarding-step-content text-center">
            <div className="welcome-icon-wrapper">
                <Sparkles size={48} className="welcome-icon" />
            </div>
            <h1 className="onboarding-title">Willkommen bei Mibuntu</h1>
            <p className="onboarding-subtitle">
                Die Plattform, die Lehrpersonen und Schulen verbindet – unterstützt durch intelligente KI.
            </p>
            <div className="welcome-features">
                <div className="feature-item">
                    <span className="feature-dot"></span>
                    <span>KI-gestützte Unterrichtsplanung</span>
                </div>
                <div className="feature-item">
                    <span className="feature-dot"></span>
                    <span>Blitzschnelle Stellvertretungssuche</span>
                </div>
                <div className="feature-item">
                    <span className="feature-dot"></span>
                    <span>Vollständig kostenlos für Lehrpersonen</span>
                </div>
            </div>
            <button className="btn-primary btn-large" onClick={() => setStep(1)}>
                Los geht's <ChevronRight size={20} />
            </button>
        </div>
    );

    const RoleStep = () => (
        <div className="onboarding-step-content">
            <h2 className="step-title">Wie möchten Sie Mibuntu nutzen?</h2>
            <p className="step-subtitle">Wählen Sie Ihre Rolle aus.</p>

            <div className="role-grid">
                <RoleCard
                    role="teacher"
                    icon={GraduationCap}
                    title="Lehrperson"
                    desc="Ich unterrichte, plane Lektionen und suche gelegentlich Stellvertretungen."
                    onClick={() => handleRoleSelect('teacher')}
                    isActive={selectedRole === 'teacher'}
                />
                <RoleCard
                    role="school_rep"
                    icon={School}
                    title="Schulleitung / Admin"
                    desc="Ich verwalte eine Schule, schreibe Stellen aus und suche Personal."
                    onClick={() => handleRoleSelect('school_rep')}
                    isActive={selectedRole === 'school_rep'}
                />
            </div>
            <div className="step-actions left">
                <button className="btn-text" onClick={() => setStep(0)}>Zurück</button>
            </div>
        </div>
    );

    const DetailsStep = () => (
        <div className="onboarding-step-content">
            <h2 className="step-title">
                {selectedRole === 'teacher' ? 'Ihr Lehrerprofil' : 'Ihre Schule'}
            </h2>
            <p className="step-subtitle">
                Vervollständigen Sie Ihre Angaben, damit wir Ihnen passende Inhalte zeigen können.
            </p>

            <form onSubmit={handleSave} className="onboarding-form">
                <div className="form-group">
                    <label className="form-label"><MapPin size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} /> Kanton</label>
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
                            <label className="form-label"><BookOpen size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} /> Fächer</label>
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
                            <label className="form-label"><GraduationCap size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} /> Stufen</label>
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
                            <label className="form-label"><User size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} /> Über mich (Optional)</label>
                            <textarea
                                placeholder="Kurze Vorstellung..."
                                className="form-input"
                                style={{ minHeight: '80px', resize: 'vertical' }}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                        </div>
                    </>
                )}

                {selectedRole === 'school_rep' && (
                    <div className="form-group">
                        <label className="form-label"><Building size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} /> Schulname</label>
                        <input
                            type="text"
                            placeholder="z.B. Primarschule Musterhausen"
                            className="form-input"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            required
                        />
                    </div>
                )}

                <div className="form-actions">
                    <button type="button" onClick={() => setStep(1)} className="btn-back">
                        Zurück
                    </button>
                    <button type="submit" disabled={saving} className="btn-submit">
                        {saving ? 'Speichert...' : 'Profil erstellen'}
                        {!saving && <ChevronRight size={20} />}
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="onboarding-container">
            <div className="onboarding-wrapper">
                {/* Progress Bar (Only for steps > 0) */}
                {step > 0 && (
                    <div className="progress-container">
                        <div className="progress-bar-bg">
                            <div
                                className="progress-bar-fill"
                                style={{ width: step === 1 ? '50%' : '90%' }}
                            />
                        </div>
                    </div>
                )}

                {step === 0 && <WelcomeStep />}
                {step === 1 && <RoleStep />}
                {step === 2 && <DetailsStep />}
            </div>
        </div>
    );
};

interface RoleCardProps {
    role: string;
    icon: LucideIcon;
    title: string;
    desc: string;
    onClick: () => void;
    isActive: boolean;
}

const RoleCard: React.FC<RoleCardProps> = ({ icon: Icon, title, desc, onClick, isActive }) => (
    <button
        type="button" // Prevent form submission if inside a form
        onClick={onClick}
        className={`role-card ${isActive ? 'selected' : ''}`}
    >
        <div className="role-icon-wrapper">
            <Icon size={32} />
        </div>
        <div className="role-content">
            <h3 className="role-title">{title}</h3>
            <p className="role-desc">{desc}</p>
        </div>
    </button>
);

export default Onboarding;
