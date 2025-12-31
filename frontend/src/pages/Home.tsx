import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { BrainCircuit, Briefcase, ChevronRight, FileText, Zap } from 'lucide-react';

function Home() {

    const navigate = useNavigate();
    const { currentUser, userProfile, loading, signInWithGoogle } = useAuth(); // Assuming signInWithGoogle is exposed

    // Remove auto-redirect useEffect

    const handleNavigation = async (path: string) => {
        if (!currentUser) {
            try {
                await signInWithGoogle();
                // After successful login, the AuthContext state will update.
                // We can't await context update here easily without complex effect logic, 
                // but usually the user is "signed in" now.
                // The re-render will show the user as logged in.

                // Ideally, we wait for profile to be determined...
                // But for a simple flow:
                // If they just logged in, they might not have a profile.
                // We should check on NEXT interaction or simply let them click again?
                // Better: check auth state change or use a callback. 
                // For this request: "Direct Login Popup -> Then Onboarding".
            } catch (error) {
                console.error("Login failed", error);
                return;
            }
        }

        // Check profile status (after potential login)
        // Since state update is async, this logic might run before context updates if we just awaited the promise.
        // However, standard Firebase signInWithPopup resolves when auth is done. 
        // We might need to manually check `auth.currentUser` if context is lagging?
        // But let's assume if they were already logged in, we proceed.
        // If they just logged in, they stay on Home but now have access.
        // Actually, the user wants "Direct Login -> Onboarding Flow".

        // Let's rely on the useEffect in App.tsx or ProtectedRoute to handle "Must have profile" 
        // BUT we want to avoid auto-redirect from Home.
        // So we explicitly check here.
    };

    // Revised approach:
    // If not logged in -> Trigger Login.
    // If logged in -> Check Profile.
    //    If Complete -> Go to Path.
    //    If Incomplete -> Go to Onboarding.

    const handleAction = async (targetPath: string) => {
        if (!currentUser) {
            try {
                await signInWithGoogle();
                // After await, we are logged in. We can't immediately check userProfile from context 
                // because it needs a fetch. 
                // But we can redirect to the target path.
                // If the target path is protected (like /planner), 
                // the ProtectedRoute will handle the "Missing Profile" check!
                navigate(targetPath);
            } catch (error) {
                console.error("Login cancelled or failed", error);
            }
        } else {
            // Already logged in
            if (!userProfile?.role) {
                navigate('/onboarding');
            } else {
                navigate(targetPath);
            }
        }
    };

    return (
        <>
            {/* Hero Section */}
            <div style={{
                backgroundColor: '#FFFFFF',
                padding: '100px 0 80px',
                textAlign: 'center'
            }}>
                <div className="container">
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#F7F7F7',
                        padding: '8px 16px',
                        borderRadius: '99px',
                        marginBottom: '24px',
                        fontSize: '14px',
                        fontWeight: 600
                    }}>
                        <span style={{ color: 'var(--color-brand)' }}>Neu</span>
                        <span>Lehrplan 21 KI-Integration</span>
                    </div>
                    <h1 style={{
                        fontSize: '48px',
                        lineHeight: '1.1',
                        marginBottom: '24px',
                        letterSpacing: '-1px'
                    }}>
                        Die Plattform für moderne<br />
                        <span style={{ color: 'var(--color-brand)' }}>Schweizer Bildung</span>
                    </h1>
                    <p style={{
                        fontSize: '20px',
                        color: 'var(--color-text-secondary)',
                        maxWidth: '600px',
                        margin: '0 auto 40px'
                    }}>
                        Mibuntu verbindet intelligente Lektionsplanung mit einem flexiblen Stellvertretungs-Marktplatz.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <button className="btn-primary" onClick={() => handleAction('/planner')}>
                            Unterricht planen
                        </button>
                        <button className="btn-secondary" onClick={() => handleAction('/marketplace')} style={{
                            padding: '14px 24px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }}>
                            Job finden
                        </button>
                    </div>
                </div>
            </div>

            {/* Value Props */}
            <div className="container" style={{ paddingBottom: '100px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '32px'
                }}>
                    {/* Card 1: The Hook */}
                    <div style={{
                        padding: '40px',
                        borderRadius: '24px',
                        backgroundColor: '#F7F7F7',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start'
                    }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <BrainCircuit color="var(--color-brand)" size={24} />
                        </div>
                        <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Der KI-Planer</h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
                            Laden Sie Ihre Materialien hoch. Unsere KI erstellt Lektionsentwürfe, die strikt auf dem Lehrplan 21 basieren.
                            Sparen Sie Stunden bei der Vorbereitung.
                        </p>
                        <ul style={{ marginBottom: '24px', display: 'grid', gap: '12px' }}>
                            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <FileText size={16} /> Automatische LP21 Referenzierung
                            </li>
                            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Zap size={16} /> Sofortige Arbeitsblätter & Tests
                            </li>
                        </ul>
                    </div>

                    {/* Card 2: The Flywheel */}
                    <div style={{
                        padding: '40px',
                        borderRadius: '24px',
                        backgroundColor: '#F7F7F7',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start'
                    }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <Briefcase color="var(--color-brand)" size={24} />
                        </div>
                        <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Stellvertretungen</h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
                            Das "Airbnb für Lehrer". Schulleiter finden sofort Ersatz. Lehrpersonen bewerben sich mit einem Klick dank
                            bereits vorhandenem Profil.
                        </p>
                        <ul style={{ marginBottom: '24px', display: 'grid', gap: '12px' }}>
                            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <ChevronRight size={16} /> Inserate in Minuten erstellen
                            </li>
                            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <ChevronRight size={16} /> One-Click Bewerbung
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
