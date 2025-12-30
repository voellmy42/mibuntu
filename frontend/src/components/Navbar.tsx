import { Link, useLocation } from 'react-router-dom';
import { User, BrainCircuit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

const Navbar = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        // Simple Google popup login for demonstration/MVP
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--color-border)',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%'
            }}>
                {/* Logo */}
                <Link to="/" style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: 'var(--color-brand)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    letterSpacing: '-0.5px'
                }}>
                    <BrainCircuit size={32} />
                    Mibuntu
                </Link>

                {/* Center Nav */}
                <div style={{ display: 'flex', gap: '32px' }}>
                    <NavLink to="/planner" label="KI-Planer" active={isActive('/planner')} />
                    <NavLink to="/marketplace" label="Marktplatz" active={isActive('/marketplace')} />
                </div>

                {/* Profile / Menu */}
                <div>
                    {user ? (
                        <Link to="/profile" style={{
                            padding: '8px 8px 8px 16px',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'box-shadow 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.displayName || 'Profile'}</span>
                            <div style={{
                                width: '32px', height: '32px', backgroundColor: '#717171', borderRadius: '50%', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                            }}>
                                {user.photoURL ? <img src={user.photoURL} alt="User" style={{ width: '100%', height: '100%' }} /> : <User size={16} />}
                            </div>
                        </Link>
                    ) : (
                        <button onClick={handleLogin} style={{
                            padding: '8px 16px',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'white',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>Login</span>
                            <User size={16} />
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, label, active }: { to: string, label: string, active: boolean }) => (
    <Link to={to} style={{
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        paddingBottom: '4px',
        borderBottom: active ? '2px solid var(--color-text-primary)' : '2px solid transparent'
    }}>
        {label}
    </Link>
);

export default Navbar;
