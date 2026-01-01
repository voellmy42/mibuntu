import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, Timestamp } from 'firebase/firestore'; // Import Timestamp
import { db } from '../firebase';
import { Check, CreditCard, Smartphone, ShieldCheck } from 'lucide-react';
import '../styles/design_tokens.css'; // Ensure tokens are available if not global

const Subscription: React.FC = () => {
    const { currentUser, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

    const handlePayment = async (method: 'credit-card' | 'twint') => {
        if (!currentUser) return;

        setLoading(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update user profile in Firestore
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                subscriptionStatus: 'premium',
                subscriptionDate: Timestamp.now(), // Use Timestamp.now()
                paymentMethod: method
            });

            // Refresh local profile state
            await refreshProfile();

            // Redirect to planner
            navigate('/planner');
        } catch (error) {
            console.error("Payment failed:", error);
            alert("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="subscription-page" style={{
            minHeight: 'calc(100vh - 80px)',
            padding: 'var(--spacing-2xl) var(--spacing-md)',
            background: 'linear-gradient(to bottom right, #FAFAFA, #F0F0F0)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div className="subscription-container" style={{
                maxWidth: '900px',
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 1fr) minmax(320px, 1fr)',
                gap: 'var(--spacing-3xl)',
                alignItems: 'start'
            }}>
                {/* Left Side: Benefits */}
                <div className="benefits-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                        <span style={{
                            background: '#FFF0F3',
                            color: 'var(--color-brand)',
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: '600'
                        }}>
                            Premium
                        </span>
                    </div>
                    <h1 style={{
                        fontSize: '42px',
                        fontWeight: '800',
                        lineHeight: '1.2',
                        marginBottom: 'var(--spacing-lg)',
                        color: 'var(--color-text-primary)'
                    }}>
                        Unlock your full teaching potential.
                    </h1>
                    <p style={{
                        fontSize: 'var(--font-size-lg)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--spacing-2xl)',
                        lineHeight: '1.6'
                    }}>
                        Get unlimited access to the AI Lesson Planner and create engaging lessons in seconds, not hours.
                    </p>

                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {[
                            "Unlimited AI Lesson Plans",
                            "Lehrplan 21 Integration",
                            "Export to PDF & Slides",
                            "Access to Premium Resources",
                            "Priority Support"
                        ].map((benefit, index) => (
                            <li key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-base)' }}>
                                <div style={{
                                    background: 'var(--color-brand)',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Check size={14} color="white" strokeWidth={3} />
                                </div>
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Side: Payment Card */}
                <div className="payment-card" style={{
                    background: 'white',
                    padding: 'var(--spacing-2xl)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-floating)',
                    border: '1px solid var(--color-border)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', marginBottom: 'var(--spacing-xs)' }}>
                            Choose your plan
                        </h2>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Cancel anytime.</p>
                    </div>

                    {/* Plan Toggle (Visual only for now) */}
                    <div style={{
                        display: 'flex',
                        background: 'var(--color-bg-secondary)',
                        padding: '4px',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: 'var(--spacing-xl)',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setSelectedPlan('monthly')}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: selectedPlan === 'monthly' ? 'white' : 'transparent',
                                boxShadow: selectedPlan === 'monthly' ? 'var(--shadow-sm)' : 'none',
                                padding: '10px',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                color: selectedPlan === 'monthly' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                            }}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setSelectedPlan('yearly')}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: selectedPlan === 'yearly' ? 'white' : 'transparent',
                                boxShadow: selectedPlan === 'yearly' ? 'var(--shadow-sm)' : 'none',
                                padding: '10px',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                color: selectedPlan === 'yearly' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                            }}
                        >
                            Yearly <span style={{ fontSize: '12px', color: 'var(--color-brand)', marginLeft: '4px' }}>-20%</span>
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', lineHeight: 1 }}>
                            <span style={{ fontSize: '24px', fontWeight: '600', marginTop: '6px' }}>CHF</span>
                            <span style={{ fontSize: '56px', fontWeight: '800', marginLeft: '4px' }}>
                                {selectedPlan === 'monthly' ? '9.90' : '95.00'}
                            </span>
                        </div>
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            per {selectedPlan === 'monthly' ? 'month' : 'year'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <button
                            onClick={() => handlePayment('credit-card')}
                            disabled={loading}
                            style={{
                                border: '1px solid var(--color-border)',
                                background: 'white',
                                padding: '16px',
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: 'var(--transition-base)',
                                fontWeight: '600',
                                fontSize: '16px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-text-primary)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CreditCard size={20} />
                                Credit Card
                            </div>
                            {loading ? <span className="loader">...</span> : <span>&rarr;</span>}
                        </button>

                        <button
                            onClick={() => handlePayment('twint')}
                            disabled={loading}
                            style={{
                                border: '1px solid var(--color-border)',
                                background: 'white',
                                padding: '16px',
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: 'var(--transition-base)',
                                fontWeight: '600',
                                fontSize: '16px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-text-primary)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Smartphone size={20} />
                                TWINT
                            </div>
                            {loading ? <span className="loader">...</span> : <span>&rarr;</span>}
                        </button>
                    </div>

                    <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                            <ShieldCheck size={14} /> Secure Payment (Mock)
                        </p>
                    </div>
                </div>
            </div>

            {/* Simple media query injection for responsiveness */}
            <style>{`
                @media (max-width: 768px) {
                    .subscription-container {
                        grid-template-columns: 1fr !important;
                        gap: var(--spacing-xl) !important;
                    }
                    .benefits-section {
                        text-align: center;
                    }
                    .benefits-section ul {
                        align-items: center; 
                    }
                }
            `}</style>
        </div>
    );
};

export default Subscription;
