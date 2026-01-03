import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Check, X } from 'lucide-react';
import '../styles/design_tokens.css';

interface PaywallModalProps {
    onClose?: () => void;
    isOpen: boolean;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handlePayment = async () => {
        if (!currentUser) return;

        setLoading(true);
        setErrorMessage(null); // Clear previous errors
        try {
            console.log("Initiating payment for user:", currentUser.uid);
            // 1. Create a checkout session in Firestore
            const collectionRef = collection(db, 'customers', currentUser.uid, 'checkout_sessions');

            // Map plans to Stripe Price IDs
            const PRICE_IDS = {
                monthly: 'price_1Sl4GnRyw3CBVJ4GW2oFvHiA', // Current ID (Verify if this is for 5 CHF)
                yearly: 'price_YEARLY_PLACEHOLDER'
            };

            const priceId = PRICE_IDS[selectedPlan];

            if (priceId === 'price_YEARLY_PLACEHOLDER') {
                setErrorMessage("Yearly plan is coming soon!");
                setLoading(false);
                return;
            }

            const docRef = await addDoc(collectionRef, {
                price: priceId,
                success_url: window.location.origin,
                cancel_url: window.location.origin,
            });

            console.log("Checkout session document created with ID:", docRef.id);

            // 2. Listen for the extension to attach the Stripe Checkout URL
            let unsubscribe: (() => void) | undefined;
            const timeoutId = setTimeout(() => {
                if (unsubscribe) unsubscribe();
                setLoading(false);
                const msg = "Payment system is not responding. Please contact support or check if the Stripe Extension is active.";
                console.error("Payment timeout:", msg);
                setErrorMessage(msg);
            }, 15000); // 15 seconds timeout

            unsubscribe = onSnapshot(docRef, (snap) => {
                const data = snap.data();
                if (!data) return;

                const { error, url } = data;

                if (error) {
                    clearTimeout(timeoutId);
                    console.error('Stripe error:', error.message);
                    setErrorMessage(`An error occurred: ${error.message}`);
                    setLoading(false);
                    if (unsubscribe) unsubscribe();
                }

                if (url) {
                    clearTimeout(timeoutId);
                    console.log("Redirecting to Stripe:", url);
                    // 3. Redirect to Stripe
                    window.location.assign(url);
                    if (unsubscribe) unsubscribe();
                }
            });

        } catch (error: any) {
            console.error("Payment initiation failed:", error);
            setErrorMessage(`Could not start payment: ${error.message || "Unknown error"}`);
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 1fr) minmax(320px, 1fr)',
                gap: 'var(--spacing-xl)',
                padding: 'var(--spacing-2xl)',
            }}>
                <button
                    onClick={() => navigate('/')} /* Fallback close to home if stuck */
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    <X size={24} color="var(--color-text-secondary)" />
                </button>

                {/* Left Side: Benefits (Same as Subscription Page but condensed) */}
                <div className="paywall-benefits">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                        <span style={{
                            background: '#FFF0F3',
                            color: 'var(--color-brand)',
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: '600'
                        }}>
                            You hit your free limit
                        </span>
                    </div>
                    <h2 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        lineHeight: '1.2',
                        marginBottom: 'var(--spacing-lg)',
                        color: 'var(--color-text-primary)'
                    }}>
                        Continue creating with Premium.
                    </h2>
                    <p style={{
                        fontSize: 'var(--font-size-base)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--spacing-xl)',
                        lineHeight: '1.6'
                    }}>
                        Unlock unlimited AI usage and take your lessons to the next level.
                    </p>

                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {[
                            "Unlimited AI Interactions",
                            "Generate PDFs & Slides",
                            "Priority Speed"
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

                {/* Right Side: Payment (Simplified) */}
                <div className="paywall-payment">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <div style={{
                            display: 'flex',
                            background: 'var(--color-bg-secondary)',
                            padding: '4px',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: 'var(--spacing-lg)',
                        }}>
                            <button
                                onClick={() => setSelectedPlan('monthly')}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    background: selectedPlan === 'monthly' ? 'white' : 'transparent',
                                    boxShadow: selectedPlan === 'monthly' ? 'var(--shadow-sm)' : 'none',
                                    padding: '8px',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    color: selectedPlan === 'monthly' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                }}
                            >
                                Monthly
                            </button>
                            <button
                                disabled
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '8px',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: '600',
                                    cursor: 'not-allowed',
                                    color: 'var(--color-text-tertiary)',
                                    opacity: 0.6
                                }}
                            >
                                Yearly (Soon)
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', lineHeight: 1 }}>
                            <span style={{ fontSize: '24px', fontWeight: '600', marginTop: '6px' }}>CHF</span>
                            <span style={{ fontSize: '42px', fontWeight: '800', marginLeft: '4px' }}>
                                {selectedPlan === 'monthly' ? '5.00' : '50.00'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        {errorMessage && (
                            <div style={{
                                color: 'var(--color-error)',
                                backgroundColor: '#FEF2F2',
                                padding: '8px',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '14px',
                                textAlign: 'center',
                                border: '1px solid var(--color-error)'
                            }}>
                                {errorMessage}
                            </div>
                        )}
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            style={{
                                background: 'var(--color-brand)',
                                color: 'white',
                                border: 'none',
                                padding: '14px',
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '16px',
                                width: '100%',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? "Processing..." : "Start Subscription"}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '8px' }}>
                            Secured by Stripe
                        </p>
                    </div>
                </div>
            </div>
            <style>{`
                @media (max-width: 768px) {
                    .paywall-modal > div { /* Target inner container */
                        grid-template-columns: 1fr !important;
                        gap: var(--spacing-lg) !important;
                        padding: var(--spacing-lg) !important;
                    }
                }
            `}</style>
        </div >
    );
};

export default PaywallModal;
