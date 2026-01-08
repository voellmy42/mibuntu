import { db } from '../firebase';
import {
    collection,
    doc,
    setDoc,
    getDocs,
    getDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import type { Message } from '../components/ChatArea';
import type { UploadedFile } from '../components/SourceSidebar';

export interface ConversationContext {
    selectedModules: string[];
    uploadedFiles: UploadedFile[];
    cycle: string;
    wishes: string;
}

export interface Conversation {
    id: string;
    userId: string;
    title: string;
    messages: Message[];
    context: ConversationContext;
    createdAt?: Timestamp;
    updatedAt?: any; // serverTimestamp returns a specific type
}

const COLLECTION_NAME = 'conversations';

export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
    } catch (error) {
        console.error("Error fetching conversations:", error);
        throw error;
    }
};

export const getConversation = async (conversationId: string): Promise<Conversation | null> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, conversationId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Conversation;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching conversation:", error);
        throw error;
    }
};

export const saveConversation = async (conversation: Conversation) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, conversation.id);
        const dataToSave = {
            ...conversation,
            updatedAt: serverTimestamp(),
            createdAt: conversation.createdAt || serverTimestamp()
        };
        // Remove id from data if it's there (spread might include it)
        delete (dataToSave as any).id;

        await setDoc(docRef, dataToSave, { merge: true });
    } catch (error) {
        console.error("Error saving conversation:", error);
        throw error;
    }
};

export const deleteConversation = async (conversationId: string) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, conversationId));
    } catch (error) {
        console.error("Error deleting conversation:", error);
        throw error;
    }
};
