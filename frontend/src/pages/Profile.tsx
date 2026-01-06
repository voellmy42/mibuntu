import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Save, User as UserIcon, Trash2, Heart } from 'lucide-react';
import { SWISS_CANTONS, SCHOOL_LEVELS, SUBJECTS_LP21 } from '../data/common';
import '../styles/Onboarding.css'; // Reuse onboarding styles
import { marketplaceService } from '../services/marketplace';
import type { JobListing } from '../types/marketplace';
import JobDetailModal from '../components/marketplace/JobDetailModal';
import { getStaticMapUrl } from '../utils/mapUtils';
import { MapPin, Calendar } from 'lucide-react';

const Profile: React.FC = () => {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [activeTab, setActiveTab] = useState<'settings' | 'favorites'>('settings');
    const [likedJobsList, setLikedJobsList] = useState<JobListing[]>([]);
    const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

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
    const [additionalDocs, setAdditionalDocs] = useState<{ name: string; url: string }[]>([]);
    const [newAdditionalFiles, setNewAdditionalFiles] = useState<File[]>([]);

    useEffect(() => {
        if (userProfile) {
            setCanton(userProfile.canton || '');
            setSelectedSubjects(userProfile.subjects || []);
            setSchoolName(userProfile.schoolName || '');
            setLevels(userProfile.levels || []);
            setBio(userProfile.bio || '');
            setPhoneNumber(userProfile.phoneNumber || '');
            setCvUrl(userProfile.cvUrl || '');
            setAdditionalDocs(userProfile.additionalDocuments || []);
        }
    }, [userProfile]);

    useEffect(() => {
        if (activeTab === 'favorites' && userProfile?.likedJobs?.length) {
            const fetchLiked = async () => {
                setIsLoadingFavorites(true);
                const jobs = await Promise.all(userProfile.likedJobs!.map(id => marketplaceService.getJob(id)));
                setLikedJobsList(jobs.filter((j): j is JobListing => j !== null));
                setIsLoadingFavorites(false);
            };
            fetchLiked();
        } else if (activeTab === 'favorites') {
            setLikedJobsList([]);
        }
    }, [activeTab, userProfile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setSaving(true);
        setSuccessMsg('');

        try {

            let uploadedCvUrl = cvUrl;

            // Upload CV if selected
            if (cvFile) {

                if (cvFile.size > 5 * 1024 * 1024) {
                    throw new Error("CV File too large (>5MB)");
                }

                const storageRef = ref(storage, `cvs/${currentUser.uid}/${cvFile.name}`);
                const snapshot = await uploadBytes(storageRef, cvFile);

                uploadedCvUrl = await getDownloadURL(snapshot.ref);
                setCvUrl(uploadedCvUrl);
            }

            // Upload Additional Documents
            const newUploadedDocs: { name: string; url: string }[] = [];
            for (const file of newAdditionalFiles) {
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`Datei ${file.name} ist zu groß (>5MB).`);
                }
                // Use a unique name to prevent overwrites or just use original name with timestamp
                const storageRef = ref(storage, `additional_docs/${currentUser.uid}/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const url = await getDownloadURL(snapshot.ref);
                newUploadedDocs.push({ name: file.name, url });
            }

            // Combine with existing docs (that haven't been deleted - assuming additionalDocs state reflects current desired list of OLD docs, 
            // but wait, if I delete a doc in UI, I should update additionalDocs state. 
            // So final list is current additionalDocs + newUploadedDocs.
            const finalAdditionalDocs = [...additionalDocs, ...newUploadedDocs];


            const userRef = doc(db, 'users', currentUser.uid);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                updates.additionalDocuments = finalAdditionalDocs;
            } else if (userProfile?.role === 'school_rep') {
                updates.schoolName = schoolName;
            }

            await updateDoc(userRef, updates);

            await refreshProfile();
            setNewAdditionalFiles([]); // Clear upload queue
            setSuccessMsg('Profil erfolgreich aktualisiert.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
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

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--color-border)', marginBottom: '32px' }}>
                <button
                    onClick={() => setActiveTab('settings')}
                    style={{
                        padding: '12px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'settings' ? '2px solid var(--color-brand)' : '2px solid transparent',
                        color: activeTab === 'settings' ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <UserIcon size={18} />
                    Einstellungen
                </button>
                <button
                    onClick={() => setActiveTab('favorites')}
                    style={{
                        padding: '12px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'favorites' ? '2px solid var(--color-brand)' : '2px solid transparent',
                        color: activeTab === 'favorites' ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Heart size={18} />
                    Merkliste
                </button>
            </div>

            {activeTab === 'favorites' ? (
                <div>
                    {isLoadingFavorites ? (
                        <p>Laden...</p>
                    ) : likedJobsList.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                            <Heart size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>Sie haben noch keine Favoriten auf Ihrer Merkliste.</p>
                            <p style={{ fontSize: '14px' }}>Besuchen Sie den Marktplatz, um interessante Stellen zu speichern.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {likedJobsList.map(job => (
                                <div key={job.id}
                                    onClick={() => setSelectedJob(job)}
                                    className="job-card"
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        border: '1px solid var(--color-border)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: 'var(--shadow-sm)',
                                        display: 'flex',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Small Image */}
                                    <div style={{
                                        width: '120px',
                                        backgroundColor: '#e5e7eb',
                                        backgroundImage: `url(${job.mapImageUrl || getStaticMapUrl(job.school || '', job.location) || job.imageUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }} />

                                    <div style={{ padding: '16px', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <h3 style={{ margin: 0, fontSize: '18px' }}>{job.title || job.subject}</h3>
                                            {job.status === 'filled' && (
                                                <span style={{ fontSize: '12px', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>BESETZT</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <span className="badge badge-primary" style={{ fontSize: '12px', padding: '2px 8px' }}>{job.subject}</span>
                                            <span className="badge badge-secondary" style={{ fontSize: '12px', padding: '2px 8px' }}>{job.cycle}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <MapPin size={14} />
                                                {job.location}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={14} />
                                                {job.startDate}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (<>
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

                                    <div className="form-group">
                                        <label className="form-label">Weitere Dokumente (Diplome, Zeugnisse, etc.)</label>

                                        {/* Existing Documents */}
                                        {additionalDocs.length > 0 && (
                                            <div style={{ marginBottom: '12px' }}>
                                                {additionalDocs.map((doc, idx) => (
                                                    <div key={idx} style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '8px'
                                                    }}>
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                                                            {doc.name}
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => setAdditionalDocs(prev => prev.filter((_, i) => i !== idx))}
                                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                                            title="Dokument entfernen"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* New Uploads Input */}
                                        <input
                                            type="file"
                                            multiple
                                            accept="application/pdf"
                                            className="form-input"
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    const files = Array.from(e.target.files);
                                                    // Check size limit
                                                    const invalidFiles = files.filter(f => f.size > 5 * 1024 * 1024);
                                                    if (invalidFiles.length > 0) {
                                                        alert(`Folgende Dateien sind zu groß (>5MB): ${invalidFiles.map(f => f.name).join(', ')}`);
                                                        e.target.value = ''; // Reset input to force re-selection
                                                        return;
                                                    }
                                                    setNewAdditionalFiles(prev => [...prev, ...files]);
                                                    // Clear value to allow selecting same file again if needed (though usually not needed if we show list)
                                                    e.target.value = '';
                                                }
                                            }}
                                            style={{ padding: '8px' }}
                                        />

                                        {/* Preview New Uploads */}
                                        {newAdditionalFiles.length > 0 && (
                                            <div style={{ marginTop: '12px' }}>
                                                <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Neu zum Hochladen (wird beim Speichern hochgeladen):</p>
                                                {newAdditionalFiles.map((file, idx) => (
                                                    <div key={idx} style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '6px 8px', border: '1px dashed #9ca3af', borderRadius: '4px', marginBottom: '6px',
                                                        backgroundColor: '#f9fafb'
                                                    }}>
                                                        <span style={{ fontSize: '13px' }}>{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewAdditionalFiles(prev => prev.filter((_, i) => i !== idx))}
                                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                            PDF, max. 5MB pro Datei.
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

                    {/* Test Notification Button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
                        <div>
                            <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>Test Notification</p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                                Sendet eine Test-Benachrichtigung an Sie selbst.
                            </p>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    await addDoc(collection(db, 'notifications'), {
                                        userId: currentUser?.uid,
                                        type: 'info',
                                        title: 'Test Benachrichtigung',
                                        message: 'Dies ist ein Test.',
                                        read: false,
                                        createdAt: serverTimestamp(),
                                        link: '/profile'
                                    });
                                    alert("Test-Benachrichtigung gesendet!");
                                } catch (e) {
                                    console.error("Error sending test notification:", e);
                                    alert("Fehler beim Senden: " + e);
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
                            Senden
                        </button>
                    </div>
                </div>


                {/* End of Settings Tab */}
            </>)
            }

            {
                selectedJob && (
                    <JobDetailModal
                        job={selectedJob}
                        onClose={() => setSelectedJob(null)}
                        onApply={() => {
                            // Refresh liked list if status changed? apply doesn't change liked status.
                            // But if user unlikes inside modal?
                            // JobDetailModal handles like state internally, but doesn't notify parent list efficiently for removal.
                            // We can just refetch or let it be until refresh.
                            // If they apply, valid.
                        }}
                        onJobUpdate={() => {
                            // Similar to marketplace
                        }}
                    />
                )
            }
        </div >
    );
};

export default Profile;
