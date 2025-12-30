import React, { useState } from 'react';
import { MODULES } from '../data/lehrplan';
import { CheckCircle2, Play, Users, BookOpen, MessageSquarePlus } from 'lucide-react';

interface PlannerSetupProps {
    onStart: (config: { selectedModules: string[], cycle: string, wishes: string }) => void;
}

const CYCLES = [
    { id: 'zyklus1', label: 'Zyklus 1 (KG - 2. Klasse)', description: 'Basisstufe, 4-8 Jahre' },
    { id: 'zyklus2', label: 'Zyklus 2 (3. - 6. Klasse)', description: 'Primarstufe, 8-12 Jahre' },
    { id: 'zyklus3', label: 'Zyklus 3 (7. - 9. Klasse)', description: 'Sekundarstufe I, 12-15 Jahre' },
];

const PlannerSetup: React.FC<PlannerSetupProps> = ({ onStart }) => {
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [selectedCycle, setSelectedCycle] = useState<string>('');
    const [wishes, setWishes] = useState('');

    const handleToggleModule = (id: string) => {
        setSelectedModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleStart = () => {
        if (selectedModules.length > 0 && selectedCycle) {
            onStart({ selectedModules, cycle: selectedCycle, wishes });
        }
    };

    const isReady = selectedModules.length > 0 && selectedCycle !== '';

    return (
        <div style={{
            height: 'calc(100vh - 80px)', // Adjust based on header
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FAFAFA',
            padding: '24px',
            overflowY: 'auto'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '800px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '32px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
                        Lektionsplan erstellen
                    </h1>
                    <p style={{ color: '#666', fontSize: '16px' }}>
                        Konfigurieren Sie Ihren Assistenten für den perfekten Unterricht.
                    </p>
                </div>

                {/* Grid Layout for Configuration */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

                    {/* Left Column: Subject & Cycle */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* 1. Subject Selection */}
                        <section>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                                <BookOpen size={18} /> Wählen Sie das Fach
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                                {MODULES.map(module => {
                                    const isSelected = selectedModules.includes(module.id);
                                    return (
                                        <div
                                            key={module.id}
                                            onClick={() => handleToggleModule(module.id)}
                                            style={{
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: `1px solid ${isSelected ? module.color : '#E5E7EB'}`,
                                                backgroundColor: isSelected ? `${module.color}10` : 'white',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: '18px', height: '18px', borderRadius: '50%',
                                                border: `2px solid ${isSelected ? module.color : '#9CA3AF'}`,
                                                backgroundColor: isSelected ? module.color : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {isSelected && <CheckCircle2 size={12} color="white" />}
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: isSelected ? 500 : 400 }}>{module.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 2. Cycle Selection */}
                        <section>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                                <Users size={18} /> Wählen Sie die Stufe
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {CYCLES.map(cycle => {
                                    const isSelected = selectedCycle === cycle.id;
                                    return (
                                        <div
                                            key={cycle.id}
                                            onClick={() => setSelectedCycle(cycle.id)}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: `2px solid ${isSelected ? 'var(--color-brand)' : '#E5E7EB'}`,
                                                backgroundColor: isSelected ? 'var(--color-brand-transparent)' : 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>{cycle.label}</span>
                                                {isSelected && <CheckCircle2 size={16} color="var(--color-brand)" />}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{cycle.description}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                    </div>

                    {/* Right Column: Wishes & Start */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* 3. Wishes */}
                        <section style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                                <MessageSquarePlus size={18} /> Zusätzliche Wünsche
                            </h3>
                            <textarea
                                value={wishes}
                                onChange={(e) => setWishes(e.target.value)}
                                placeholder="Beschreiben Sie Ihre Lektionsidee, Lernziele oder spezielle Anforderungen..."
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    resize: 'none',
                                    outline: 'none',
                                    minHeight: '200px'
                                }}
                            />
                        </section>

                        {/* Start Button */}
                        <button
                            onClick={handleStart}
                            disabled={!isReady}
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: isReady ? 'var(--color-brand)' : '#E5E7EB',
                                color: isReady ? 'white' : '#9CA3AF',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 700,
                                cursor: isReady ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                transition: 'all 0.2s',
                                boxShadow: isReady ? '0 4px 6px -1px var(--color-brand-transparent)' : 'none'
                            }}
                        >
                            <Play size={20} fill={isReady ? 'currentColor' : 'none'} />
                            Planung starten
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlannerSetup;
