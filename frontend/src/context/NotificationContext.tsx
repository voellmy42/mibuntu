import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    limit,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import type { Notification } from '../types/notifications';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    sendNotification: (userId: string, data: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        // Query for user's notifications, ordered by date desc
        // Removed orderBy/limit here to avoid needing a Composite Index (userId + createdAt)
        // Since user notification volume is low, fetching all matching and sorting client-side is fine.
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notes: Notification[] = [];
            let unread = 0;

            snapshot.docs.forEach(doc => {
                const data = doc.data() as Omit<Notification, 'id'>;
                notes.push({ ...data, id: doc.id });
                if (!data.read) unread++;
            });

            // Client-side sort (descending by createdAt)
            notes.sort((a, b) => {
                const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return tB - tA;
            });

            setNotifications(notes);
            setUnreadCount(unread);
        }, (error) => {
            console.error("Error fetching notifications:", error);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const markAsRead = async (id: string) => {
        try {
            const notifRef = doc(db, 'notifications', id);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        // Ideally use a batch write, but for simple UI action we iterate for now 
        // or we can implement a batch function if strictly needed.
        // For V1, let's just mark visible ones for simplicity or do it one by one in UI usually.
        // Let's implement a simple batch for visible unread notes.
        const unreadNotes = notifications.filter(n => !n.read);
        // Batch limit is 500, we fetched 50 so safe.
        // Importing writeBatch is needed for atomic update but straightforward Promise.all is okay for small scale
        const updates = unreadNotes.map(n => markAsRead(n.id));
        await Promise.all(updates);
    };

    const sendNotification = async (userId: string, data: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>) => {
        try {
            console.log('Sending notification to:', userId, data);
            await addDoc(collection(db, 'notifications'), {
                userId,
                ...data,
                read: false,
                createdAt: serverTimestamp()
            });
            console.log('Notification sent successfully');
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, sendNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
