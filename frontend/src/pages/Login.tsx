import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-background">
            <div className="p-8 border rounded-lg shadow-lg bg-card max-w-md w-full text-center">
                <h1 className="text-3xl font-bold mb-6 text-primary">Willkommen bei Mibuntu</h1>
                <p className="text-muted-foreground mb-8">
                    Bitte melden Sie sich an, um fortzufahren.
                </p>

                <button
                    onClick={handleLogin}
                    className="flex items-center justify-center w-full gap-3 px-6 py-3 text-white transition-colors rounded-md bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                    <LogIn size={20} />
                    <span>Mit Google anmelden</span>
                </button>
            </div>
        </div>
    );
};

export default Login;
