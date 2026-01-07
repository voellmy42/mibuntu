import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import '../styles/Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const { currentUser, userProfile, logout, signInWithGoogle } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '1280px', margin: '0 auto', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Menu">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <Link to="/" className="navbar-logo">
                        <img src="/logo.jpg" alt="Mibuntu Logo" className="logo-image" />
                        <span className="logo-text">Mibuntu</span>
                    </Link>
                </div>

                <div className="navbar-center">
                    <div className="navbar-links">
                        <Link to="/planner" className="nav-link">Planer</Link>
                        <Link to="/marketplace" className="nav-link">Marktplatz</Link>
                        <Link to="/updates" className="nav-link">Updates</Link>
                    </div>
                </div>

                <div className="navbar-actions">
                    {currentUser && <NotificationCenter />}
                    {currentUser ? (
                        <div className="navbar-user-section">
                            <Link to="/profile" className="navbar-user-pill" style={{ textDecoration: 'none' }}>
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
                            </Link>

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

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <Link to="/planner" className="mobile-nav-link">Planer</Link>
                    <Link to="/marketplace" className="mobile-nav-link">Marktplatz</Link>
                    <Link to="/updates" className="mobile-nav-link">Updates</Link>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
