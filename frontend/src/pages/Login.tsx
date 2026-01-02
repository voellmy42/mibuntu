import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';
import '../styles/Login.css';

const Login: React.FC = () => {
    const { signInWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            // Check handled by Home or ProtectedRoute usually, but if user landed here explicitly:
            // If they have a role, go to planner, else onboarding.
            // But we can't check role easily here without context drill-down waiting.
            // Safest: go to /onboarding, which redirects to /planner if complete.
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
        <div className="login-container">
            {/* Decorative Background */}
            <div className="login-bg-shape shape-1" />
            <div className="login-bg-shape shape-2" />

            <div className="login-card">
                <div className="login-logo-wrapper">
                    <Sparkles size={40} strokeWidth={1.5} />
                </div>

                <h1 className="login-title">
                    Willkommen zurück
                </h1>

                <p className="login-subtitle">
                    Melden Sie sich an, um Ihren Unterricht zu planen oder Stellvertretungen zu verwalten.
                </p>

                <button
                    onClick={handleLogin}
                    className="login-btn-google"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        style={{ width: '20px', height: '20px' }}
                    />
                    <span>Weiter mit Google</span>
                </button>

                <div className="login-footer">
                    Durch die Anmeldung akzeptieren Sie unsere<br />
                    <a href="#" className="login-link">Nutzungsbedingungen</a> und <a href="#" className="login-link">Datenschutzerklärung</a>.
                </div>
            </div>
        </div>
    );
};

export default Login;
