import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import '../styles/Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const { currentUser, userProfile, logout, signInWithGoogle } = useAuth();

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
            // After login, if they have no profile, redirect to onboarding? 
            // Or typically we stay on the page. But user requested:
            // "If user logged in and profile incomplete -> Onboarding".
            // Since context updates async, check logic might be tricky here.
            // But simpler: Login Popup closes -> User is on Home.
            // If they try to click Planner -> handleAction takes over.
            // But "Anmelden" specifically often signifies just "Sign In".
            // We can optionally check:
            // const user = auth.currentUser;
            // if (user) fetchProfile...
            // For now, let's just Sign In. The UI will update to show "User Profile"
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <nav className="navbar">
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
                <Link to="/" className="navbar-logo">
                    <span className="logo-text">Mibuntu</span>
                </Link>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <div className="navbar-links">
                        <Link to="/planner" className="nav-link">Planer</Link>
                        <Link to="/marketplace" className="nav-link">Marktplatz</Link>
                    </div>
                </div>

                <div className="navbar-actions">
                    {currentUser ? (
                        <div className="navbar-user-section">
                            <div className="navbar-user-pill">
                                <div className="user-info">
                                    <span className="user-name">{currentUser.displayName}</span>
                                    <span className="user-role">
                                        {userProfile?.role === 'teacher' ? 'Lehrperson' :
                                            userProfile?.role === 'school_rep' ? 'Schulleitung' : 'Gast'}
                                    </span>
                                </div>
                                {currentUser.photoURL ? (
                                    <img
                                        src={currentUser.photoURL}
                                        alt="Profile"
                                        className="user-avatar"
                                    />
                                ) : (
                                    <div className="user-avatar-placeholder">
                                        <UserIcon size={16} />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleLogout}
                                className="logout-button"
                                title="Abmelden"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <button
                            className="navbar-cta-button"
                            onClick={handleLogin}
                        >
                            Anmelden
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
