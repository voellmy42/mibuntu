import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireOnboarding = true }) => {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>; // Simple loading state for now
    }

    // If not authenticated, redirect to Home
    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // If authenticated but no profile (role), redirect to Onboarding
    // EXCEPT if we are currently ON the onboarding page (handled by logic in routes usually, 
    // but here we can add a prop or check path if needed, but easier to handle in App.tsx structure)
    // Actually, if we are in ProtectedRoute, we usually want to ensure profile exists.
    // If we want to Protect the Onboarding route itself (so only logged in users can see it), 
    // we should allow it even if profile is missing.

    if (requireOnboarding && !userProfile?.role) {
        return <Navigate to="/onboarding" />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
