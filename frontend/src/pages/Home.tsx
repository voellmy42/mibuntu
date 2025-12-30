import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Briefcase, ChevronRight, FileText, Zap } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

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
                        <button className="btn-primary" onClick={() => navigate('/planner')}>
                            Unterricht planen
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/marketplace')} style={{
                            padding: '14px 24px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'white'
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
