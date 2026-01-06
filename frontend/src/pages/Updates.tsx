import { CheckCircle2, Megaphone } from 'lucide-react';

const updates = [
    {
        id: '2',
        date: '6. Januar 2026',
        title: 'Marktplatz & Profil Erweiterungen',
        description: 'Wir haben das Nutzererlebnis im Marktplatz und im Profilbereich mit neuen Funktionen erweitert:',
        features: [
            'Google Maps Integration: Standorte werden nun direkt auf einer Karte angezeigt, inklusive Routenplanung per Klick.',
            'Diplom-Upload: Lehrpersonen können nun ihre Diplome und Zertifikate sicher im privaten Profilbereich hinterlegen.',
            'Like & Share: Setzen Sie interessante Inserate auf Ihre persönliche Merkliste (Favoriten) oder teilen Sie diese direkt per Link.'
        ],
        type: 'feature'
    },
    {
        id: '1',
        date: '2. Januar 2026',
        title: 'Erweiterte Export-Formate für den Planer',
        description: 'Der KI-Klassenplaner unterstützt nun zwei neue Export-Optionen:',
        features: [
            'Schüler-Dossier (Word): Erstellt ein automatisch formatiertes Arbeitsblatt für Lernende.',
            'Präsentation (PowerPoint): Generiert eine vollständige 16:9 Präsentation mit Folien und Notizen.',
            'Mibuntu Branding: Alle Dokumente kommen im professionellen Mibuntu-Design.'
        ],
        type: 'feature'
    },
    {
        id: '0',
        date: '1. Januar 2026',
        title: 'Mibuntu Alpha Launch',
        description: 'Der offizielle Start der Mibuntu Plattform in der Alpha-Version. Wir freuen uns, die ersten Lehrpersonen an Bord begrüssen zu dürfen.',
        features: [
            'KI-Lektionsplaner: Erstellt vollständige Lektionen basierend auf dem Lehrplan 21.',
            'Stellvertretungs-Marktplatz: Finden Sie schnell und einfach passende Stellen oder Lehrpersonen.',
            'Integriertes Profilsystem: Verwalten Sie Ihre Daten und Präferenzen zentral.'
        ],
        type: 'update'
    }
];

const Updates = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: '#EFF6FF', color: 'var(--color-brand)',
                    padding: '8px 16px', borderRadius: '100px', marginBottom: '16px'
                }}>
                    <Megaphone size={20} style={{ marginRight: '8px' }} />
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Product Updates</span>
                </div>
                <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    Neuigkeiten bei Mibuntu
                </h1>
                <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                    Wir arbeiten ständig daran, Mibuntu besser zu machen. Hier findest du die neuesten Funktionen und Verbesserungen.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                {updates.map((update) => (
                    <div key={update.id} style={{
                        display: 'flex', gap: '32px',
                        flexDirection: window.innerWidth < 768 ? 'column' : 'row'
                    }}>
                        {/* Timeline / Date */}
                        <div style={{ flexShrink: 0, width: '150px', position: 'relative' }}>
                            <div style={{
                                fontSize: '14px', fontWeight: 600, color: 'var(--color-text-tertiary)',
                                textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>
                                {update.date}
                            </div>
                            {/* Simple line for timeline feel if desired, though separate blocks work well too */}
                        </div>

                        {/* Content Card */}
                        <div style={{
                            flex: 1,
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            border: '1px solid var(--color-border)',
                            padding: '32px',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{
                                    backgroundColor: update.type === 'feature' ? '#ECFDF5' : '#EFF6FF',
                                    padding: '6px 12px', borderRadius: '6px',
                                    color: update.type === 'feature' ? '#059669' : '#1D4ED8',
                                    fontSize: '12px', fontWeight: 700, textTransform: 'uppercase'
                                }}>
                                    {update.type === 'feature' ? 'Neues Feature' : 'Update'}
                                </div>
                            </div>

                            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text-primary)' }}>
                                {update.title}
                            </h2>
                            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                                {update.description}
                            </p>

                            {update.features && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {update.features.map((feature, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <CheckCircle2 size={20} color="var(--color-brand)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                            <span style={{ fontSize: '15px', color: 'var(--color-text-primary)' }}>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Updates;
