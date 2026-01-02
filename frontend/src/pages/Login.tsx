import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles } from 'lucide-react';

const Login: React.FC = () => {
    const { signInWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/onboarding');
        }
    }, [currentUser, navigate]);

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Failed to sign in", error);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '48px',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-xl)',
                maxWidth: '440px',
                width: '100%',
                textAlign: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        backgroundColor: 'var(--color-brand-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-brand)'
                    }}>
                        <Sparkles size={32} />
                    </div>
                </div>

                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: 'var(--color-text-primary)'
                }}>
                    Mibuntu
                </h1>

                <p style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: '32px',
                    fontSize: '16px',
                    lineHeight: '1.5'
                }}>
                    Die Plattform für Lehrpersonen und Schulen. <br />
                    Intelligent vernetzt.
                </p>

                <button
                    onClick={handleLogin}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        padding: '12px 24px',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        height: '50px'
                    }}
                >
                    <LogIn size={20} />
                    <span>Mit Google anmelden</span>
                </button>

                <div style={{ marginTop: '24px', fontSize: '12px', color: '#9ca3af' }}>
                    Indem Sie fortfahren, akzeptieren Sie unsere <a href="#" style={{ textDecoration: 'underline' }}>Nutzungsbedingungen</a>.
                </div>
            </div>
        </div>
    );
};

export default Login;
