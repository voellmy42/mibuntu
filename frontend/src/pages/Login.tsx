import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';
import '../styles/Login.css';

const Login: React.FC = () => {
    const { signInWithGoogle, loginWithEmail, registerWithEmail, currentUser } = useAuth();
    const navigate = useNavigate();

    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            navigate('/onboarding');
        }
    }, [currentUser, navigate]);

    const handleGoogleLogin = async () => {
        try {
            setError('');
            await signInWithGoogle();
        } catch (error: any) {
            console.error("Failed to sign in", error);
            setError('Google Anmeldung fehlgeschlagen.');
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                await registerWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
            // Navigation handled by useEffect
        } catch (err: any) {
            console.error("Auth error:", err);
            let msg = 'Ein Fehler ist aufgetreten.';
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                msg = 'E-Mail oder Passwort falsch.';
            } else if (err.code === 'auth/email-already-in-use') {
                msg = 'Diese E-Mail wird bereits verwendet.';
            } else if (err.code === 'auth/weak-password') {
                msg = 'Das Passwort ist zu schwach (min. 6 Zeichen).';
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Decorative Background */}
            <div className="login-bg-shape shape-1" />
            <div className="login-bg-shape shape-2" />

            <div className="login-card">
                <div className="login-logo-wrapper">
                    <Sparkles size={40} strokeWidth={1.5} />
                </div>

                <h1 className="login-title">
                    {isRegistering ? 'Konto erstellen' : 'Willkommen zurück'}
                </h1>

                <p className="login-subtitle">
                    {isRegistering
                        ? 'Erstellen Sie ein Konto, um loszulegen.'
                        : 'Melden Sie sich an, um Ihren Unterricht zu planen oder Stellvertretungen zu verwalten.'}
                </p>

                <form onSubmit={handleEmailAuth} className="login-form">
                    <div className="form-group">
                        <input
                            type="email"
                            className="form-input"
                            placeholder="E-Mail Adresse"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginTop: '12px' }}>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Passwort"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '24px', padding: '12px', fontSize: '16px' }}
                    >
                        {loading ? 'Laden...' : (isRegistering ? 'Registrieren' : 'Anmelden')}
                    </button>
                </form>

                <div className="login-divider">
                    <span>oder</span>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="login-btn-google"
                    type="button"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        style={{ width: '20px', height: '20px' }}
                    />
                    <span>{isRegistering ? 'Registrieren mit Google' : 'Weiter mit Google'}</span>
                </button>

                <div className="login-toggle">
                    {isRegistering ? 'Bereits ein Konto?' : 'Noch kein Konto?'}
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError('');
                        }}
                        className="login-link"
                        style={{ background: 'none', border: 'none', padding: 0, marginLeft: '5px', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit', color: 'var(--color-brand)' }}
                    >
                        {isRegistering ? 'Anmelden' : 'Registrieren'}
                    </button>
                </div>

                <div className="login-footer">
                    Durch die Anmeldung akzeptieren Sie unsere<br />
                    <a href="#" className="login-link">Nutzungsbedingungen</a> und <a href="#" className="login-link">Datenschutzerklärung</a>.
                </div>
            </div>
        </div>
    );
};

export default Login;
