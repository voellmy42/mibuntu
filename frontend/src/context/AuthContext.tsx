import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
    type User,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { UserProfile } from '../types/user';

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: (optimisticData?: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = useCallback(async (uid: string) => {
        try {
            // 1. Fetch User Data
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);

            let profileData: UserProfile | null = null;
            if (docSnap.exists()) {
                profileData = docSnap.data() as UserProfile;
            }

            // 2. Check for Active Subscription (Stripe Extension)
            // The extension writes to customers/{uid}/subscriptions
            let isPremium = false;
            try {
                const subsRef = collection(db, 'customers', uid, 'subscriptions');
                const q = query(subsRef, where('status', 'in', ['active', 'trialing']));
                const querySnapshot = await getDocs(q);
                isPremium = !querySnapshot.empty;
            } catch (subError) {
                console.warn("Failed to check subscription status:", subError);
                // Default to false (free) if check fails
            }

            if (profileData) {
                // If we found an active Stripe subscription, force status to premium
                if (isPremium) {
                    profileData.subscriptionStatus = 'premium';
                }
                setUserProfile(profileData);
            } else {
                // Handle case where user doc doesn't exist but auth does (rare)
                if (isPremium) {
                    // Create a minimal profile in memory if needed, or leave null
                    // For now, consistent with logic:
                    setUserProfile({
                        uid,
                        email: auth.currentUser?.email || null,
                        displayName: auth.currentUser?.displayName || null,
                        photoURL: auth.currentUser?.photoURL || null,
                        subscriptionStatus: 'premium'
                    });
                } else {
                    setUserProfile(null);
                }
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUserProfile(null);
        }
    }, [])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [fetchUserProfile]);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    };

    const refreshProfile = async (optimisticData?: UserProfile) => {
        if (optimisticData) {
            setUserProfile(optimisticData);
            return;
        }
        // Always fetch to ensure server consistency and get any triggered functions data (like subscription status)
        if (currentUser) {
            await fetchUserProfile(currentUser.uid);
        }
    };

    const value = {
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        logout,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
