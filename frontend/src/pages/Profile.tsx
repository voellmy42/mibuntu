import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
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

    // Private Data
    const [phoneNumber, setPhoneNumber] = useState('');
    const [cvUrl, setCvUrl] = useState('');
    const [cvFile, setCvFile] = useState<File | null>(null);

    useEffect(() => {
        if (userProfile) {
            setCanton(userProfile.canton || '');
            setSelectedSubjects(userProfile.subjects || []);
            setSchoolName(userProfile.schoolName || '');
            setLevels(userProfile.levels || []);
            setBio(userProfile.bio || '');
            setPhoneNumber(userProfile.phoneNumber || '');
            setCvUrl(userProfile.cvUrl || '');
        }
    }, [userProfile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setSaving(true);
        setSuccessMsg('');

        try {
            console.log("Starting profile save...");
            let uploadedCvUrl = cvUrl;

            // Upload CV if selected
            if (cvFile) {
                console.log("Uploading file:", cvFile.name, "Size:", cvFile.size);
                if (cvFile.size > 5 * 1024 * 1024) {
                    throw new Error("File too large (>5MB)");
                }

                const storageRef = ref(storage, `cvs/${currentUser.uid}/${cvFile.name}`);
                const snapshot = await uploadBytes(storageRef, cvFile);
                console.log("Upload success, fetching URL...");
                uploadedCvUrl = await getDownloadURL(snapshot.ref);
                setCvUrl(uploadedCvUrl);
            }

            console.log("Updating Firestore...");
            const userRef = doc(db, 'users', currentUser.uid);

            const updates: any = {
                canton,
                updatedAt: serverTimestamp(),
            };

            if (userProfile?.role === 'teacher') {
                updates.subjects = selectedSubjects;
                updates.levels = levels;
                updates.bio = bio;
                updates.phoneNumber = phoneNumber;
                updates.cvUrl = uploadedCvUrl;
            } else if (userProfile?.role === 'school_rep') {
                updates.schoolName = schoolName;
            }

            await updateDoc(userRef, updates);
            console.log("Firestore update success");
            await refreshProfile();
            setSuccessMsg('Profil erfolgreich aktualisiert.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error: any) {
            console.error("Detailed error updating profile:", error);
            if (error.code === 'storage/unauthorized') {
                alert("Fehler: Keine Berechtigung für Upload. Bitte 'storage.rules' in der Firebase Console prüfen.");
            } else {
                alert(`Fehler beim Speichern: ${error.message || error}`);
            }
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

                            <div style={{ marginTop: '32px', marginBottom: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Private Kontaktdaten</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                                    Diese Daten sind nur für Schulen sichtbar, bei denen Sie sich bewerben.
                                </p>

                                <div className="form-group">
                                    <label className="form-label">Telefonnummer</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+41 79 123 45 67"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Lebenslauf (CV)</label>
                                    {cvUrl && (
                                        <div style={{ marginBottom: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: 'green', fontWeight: 600 }}>✓ CV hinterlegt</span>
                                            <a href={cvUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                                                Ansehen
                                            </a>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="form-input"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setCvFile(e.target.files[0]);
                                            }
                                        }}
                                        style={{ padding: '8px' }}
                                    />
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                        PDF, max. 5MB. Hochladen überschreibt existierenden CV.
                                    </p>
                                </div>
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

            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '16px', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Developer Zone
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
                    <div>
                        <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>Rollen-Wechsler</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                            Wechseln Sie die Rolle, um beide Seiten (Lehrer/Schule) zu testen.
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            if (!currentUser || !userProfile) return;
                            const newRole = userProfile.role === 'teacher' ? 'school_rep' : 'teacher';
                            if (confirm(`Rolle wirklich zu "${newRole === 'teacher' ? 'Lehrperson' : 'Schulleitung'}" wechseln?`)) {
                                try {
                                    await updateDoc(doc(db, 'users', currentUser.uid), { role: newRole });
                                    window.location.reload(); // Reload to force fresh state
                                } catch (e) {
                                    console.error("Error switching role:", e);
                                    alert("Fehler beim Wechseln der Rolle.");
                                }
                            }
                        }}
                        style={{
                            backgroundColor: 'white',
                            border: '1px solid var(--color-border)',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '14px'
                        }}
                    >
                        Zu {userProfile.role === 'teacher' ? 'Schulleitung' : 'Lehrperson'} wechseln
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
