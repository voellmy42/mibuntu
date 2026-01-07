import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Briefcase, ChevronRight, Zap, ExternalLink, AlertTriangle, ShieldCheck, Github } from 'lucide-react';
import '../styles/Home.css';

function Home() {

    const navigate = useNavigate();
    const { currentUser, userProfile, signInWithGoogle } = useAuth();

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
            <div className="home-hero-section">
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="home-hero-badge">
                        <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                        <span>Die professionelle Alternative zu WhatsApp-Chats</span>
                    </div>
                    <h1 className="home-hero-title">
                        Bildungsorganisation<br />
                        <span style={{ color: 'var(--color-brand)' }}>endlich professionell.</span>
                    </h1>
                    <p className="home-hero-subtitle">
                        Mibuntu beendet das Chaos privater Chats. Wir verbinden intelligente Lektionsplanung mit einem fairen, transparenten Marktplatz für Stellvertretungen.
                    </p>
                    <div className="home-hero-actions">
                        <button className="btn-primary" onClick={() => handleAction('/planner')} style={{ padding: '16px 32px', fontSize: '16px' }}>
                            Kostenlos starten
                        </button>
                        <button className="btn-secondary" onClick={() => handleAction('/marketplace')} style={{
                            padding: '16px 32px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}>
                            Marktplatz entdecken
                        </button>
                    </div>
                </div>
            </div>

            {/* The Problem Section */}
            <div className="home-section-problem">
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
                        <div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                color: 'var(--color-brand)', fontWeight: 600, marginBottom: '16px'
                            }}>
                                <AlertTriangle size={20} />
                                <span>Das Problem</span>
                            </div>
                            <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px', lineHeight: '1.2' }}>
                                Intransparenz & "Chat-Chaos"
                            </h2>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '18px', lineHeight: '1.6', marginBottom: '24px' }}>
                                Viele Schulen organisieren Stellvertretungen heute noch über private WhatsApp-Gruppen.
                                Das ist nicht nur datenschutzrechtlich bedenklich, sondern führt zu undurchsichtigen Strukturen,
                                Vetternwirtschaft und unnötigem Stress in der Freizeit von Lehrpersonen.
                            </p>
                        </div>

                        {/* Proof Point Card */}
                        <a
                            href="https://www.20min.ch/story/lehrer-in-der-schweiz-admin-verlangt-10-franken-chat-gebuehr-lehrer-laufen-sturm-103477821"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                display: 'block',
                                transition: 'transform 0.2s'
                            }}
                            className="hover-card"
                        >
                            <div style={{
                                backgroundColor: 'white',
                                padding: '24px',
                                borderRadius: '16px',
                                border: '1px solid rgba(0,0,0,0.08)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                    Aktueller Bericht auf 20min.ch
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', lineHeight: '1.4' }}>
                                    "Admin verlangt 10 Franken Chat-Gebühr – Lehrer laufen Sturm"
                                </h3>
                                <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', marginBottom: '16px' }}>
                                    Ein aktuelles Beispiel zeigt, wie anfällig informelle Chat-Lösungen für Missbrauch sind.
                                    Mibuntu bietet hier die professionelle, institutionelle Antwort.
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-brand)', fontWeight: 600, fontSize: '14px' }}>
                                    Zum Artikel lesen <ExternalLink size={14} />
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            {/* Value Props / Solution */}
            <div className="container" style={{ padding: '100px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>Unsere Lösung</h2>
                    <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)' }}>Zwei starke Werkzeuge in einer Plattform</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '32px'
                }}>
                    {/* Card 1: The AI Planner */}
                    <div style={{
                        padding: '48px',
                        borderRadius: '32px',
                        backgroundColor: '#F7F7F7',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start',
                        transition: 'transform 0.2s',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--color-brand-light)', color: 'var(--color-brand)', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700 }}>
                            PREMIUM
                        </div>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <BrainCircuit color="var(--color-brand)" size={28} />
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>1. Der KI-Lektionsplaner</h3>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', fontStyle: 'italic' }}>
                            Gebühr deckt API-Kosten
                        </p>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: '1.6', fontSize: '16px' }}>
                            Nutzen Sie die Kraft von KI, aber bleiben Sie konform. Unser Planer referenziert automatisch den <strong>Lehrplan 21</strong> und erstellt maßgeschneiderte Unterrichtsmaterialien aus Ihren Inputs.
                        </p>
                        <ul style={{ marginBottom: '32px', display: 'grid', gap: '16px', width: '100%' }}>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px' }}>
                                <div style={{ background: '#E0F2FE', padding: '6px', borderRadius: '50%', color: 'var(--color-brand)' }}><ShieldCheck size={14} /></div>
                                LP21 Konformität garantiert
                            </li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px' }}>
                                <div style={{ background: '#E0F2FE', padding: '6px', borderRadius: '50%', color: 'var(--color-brand)' }}><Zap size={14} /></div>
                                80% Zeitersparnis bei der Vorbereitung
                            </li>
                        </ul>
                        <button className="btn-primary" onClick={() => handleAction('/planner')} style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
                            Jetzt Lektion planen
                        </button>
                    </div>

                    {/* Card 2: The Marketplace */}
                    <div style={{
                        padding: '48px',
                        borderRadius: '32px',
                        backgroundColor: '#F7F7F7',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: '24px', right: '24px', background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700 }}>
                            KOSTENLOS
                        </div>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <Briefcase color="var(--color-brand)" size={28} />
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>2. Der Stellen-Marktplatz</h3>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', fontStyle: 'italic' }}>
                            Unser Beitrag gegen den Lehrermangel
                        </p>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: '1.6', fontSize: '16px' }}>
                            Die transparente Alternative zu WhatsApp-Chats. Keine Zwischenhändler, keine Gebühren. Wir wollen das Problem lösen, nicht daran verdienen.
                        </p>
                        <ul style={{ marginBottom: '32px', display: 'grid', gap: '16px', width: '100%' }}>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px' }}>
                                <div style={{ background: '#E0F2FE', padding: '6px', borderRadius: '50%', color: 'var(--color-brand)' }}><ChevronRight size={14} /></div>
                                Offizielle, transparente Ausschreibungen
                            </li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px' }}>
                                <div style={{ background: '#E0F2FE', padding: '6px', borderRadius: '50%', color: 'var(--color-brand)' }}><ChevronRight size={14} /></div>
                                Kostenlos für alle
                            </li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px' }}>
                                <div style={{ background: '#E0F2FE', padding: '6px', borderRadius: '50%', color: 'var(--color-brand)' }}><ChevronRight size={14} /></div>
                                Direktes Matching über Profile
                            </li>
                        </ul>
                        <button className="btn-secondary" onClick={() => handleAction('/marketplace')} style={{
                            width: '100%',
                            justifyContent: 'center',
                            backgroundColor: 'white',
                            border: '1px solid var(--color-border)',
                            padding: '12px',
                            marginTop: 'auto'
                        }}>
                            Vakanzen ansehen
                        </button>
                    </div>
                </div>
            </div>


            {/* Open Source Section */}
            <div className="container" style={{ marginBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#166534',
                    padding: '8px 16px',
                    borderRadius: '99px',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '24px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <ShieldCheck size={16} /> Transparenz & Vertrauen
                </div>

                <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '24px' }}>
                    Wir bauen Mibuntu gemeinsam.
                </h2>
                <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', maxWidth: '750px', lineHeight: '1.6', marginBottom: '40px' }}>
                    Wir glauben, dass Bildungstechnologie keine "Black Box" sein darf. Deshalb ist unser Code öffentlich einsehbar (Open Source).
                    Wir laden Entwickler, Lehrpersonen und Schulen ein, uns zu überprüfen und aktiv bei der Weiterentwicklung zu helfen.
                </p>

                <button
                    className="btn-secondary"
                    onClick={() => window.open('https://github.com/voellmy42/mibuntu', '_blank')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px',
                        backgroundColor: '#24292F', color: 'white', border: 'none', cursor: 'pointer',
                        borderRadius: 'var(--radius-md)', fontWeight: 600
                    }}
                >
                    <Github size={20} />
                    Code auf GitHub ansehen
                </button>
            </div>

            {/* Mission Statement */}
            <div style={{ backgroundColor: 'var(--color-secondary)', color: 'white', padding: '80px 0', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: 'white' }}>Unsere Mission</h2>
                    <p style={{ fontSize: '18px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6', color: '#9CA3AF' }}>
                        "In Zeiten des Lehrermangels darf die Vermittlung keine Hürden haben.
                        Deshalb ist der Marktplatz für Stellvertretungen komplett kostenlos – so convenient wie eine WhatsApp-Gruppe, aber professionell und sicher.
                        Gebühren fallen nur dort an, wo uns durch modernste KI-Modelle echte Kosten entstehen."
                    </p>
                </div>
            </div>
        </>
    );
}

export default Home;
