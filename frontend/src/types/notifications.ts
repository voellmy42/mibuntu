
import { Timestamp } from 'firebase/firestore';

export interface Notification {
    id: string;
    userId: string; // The recipient
    type: 'new_application' | 'info';
    title: string;
    message: string;
    read: boolean;
    createdAt: Timestamp;
    link?: string; // Optional link to redirect to
    metadata?: any;
}
