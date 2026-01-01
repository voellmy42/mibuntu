import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PremiumRoute: React.FC = () => {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/" />;
    }

    if (!userProfile?.role) {
        return <Navigate to="/onboarding" />;
    }

    // Check for premium status
    if (userProfile?.subscriptionStatus !== 'premium') {
        return <Navigate to="/subscription" />;
    }

    return <Outlet />;
};

export default PremiumRoute;
