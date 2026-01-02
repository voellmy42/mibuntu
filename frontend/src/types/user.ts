import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role?: 'teacher' | 'school_rep';
    createdAt?: Timestamp;
    canton?: string;
    subjects?: string[];
    levels?: string[];
    schoolName?: string;
    bio?: string;
    phoneNumber?: string;
    cvUrl?: string;
    subscriptionStatus?: 'free' | 'premium';
    subscriptionDate?: Timestamp;
    aiInteractionCount?: number; // Track number of AI interactions
}
