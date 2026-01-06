import { db } from '../firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    doc,
    getDoc
} from 'firebase/firestore';
import type { JobListing, JobApplication } from '../types/marketplace';

const JOBS_COLLECTION = 'jobs';
const APPLICATIONS_COLLECTION = 'applications';

export const marketplaceService = {
    // Fetch all jobs, optionally filtered
    getJobs: async (): Promise<JobListing[]> => {
        try {
            const jobsRef = collection(db, JOBS_COLLECTION);
            // Default sort by creation time desc
            const q = query(jobsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as JobListing));
        } catch (error) {
            console.error("Error fetching jobs:", error);
            return [];
        }
    },

    getJob: async (jobId: string): Promise<JobListing | null> => {
        try {
            const docRef = doc(db, JOBS_COLLECTION, jobId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as JobListing;
            }
            return null;
        } catch (error) {
            console.error("Error fetching job:", error);
            return null;
        }
    },

    // Get jobs created by a specific user (school rep)
    getJobsByUser: async (userId: string): Promise<JobListing[]> => {
        try {
            const q = query(
                collection(db, JOBS_COLLECTION),
                where("userId", "==", userId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as JobListing)).sort((a, b) => b.createdAt - a.createdAt);
        } catch (error) {
            console.error("Error fetching user jobs:", error);
            return [];
        }
    },

    // Create a new job listing
    createJob: async (job: Omit<JobListing, 'id' | 'createdAt'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, JOBS_COLLECTION), {
                ...job,
                createdAt: Date.now()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating job:", error);
            throw error;
        }
    },

    // Apply to a job
    applyToJob: async (application: Omit<JobApplication, 'id' | 'appliedAt' | 'status'>): Promise<string> => {
        try {
            // Check for existing application
            const q = query(
                collection(db, APPLICATIONS_COLLECTION),
                where("jobId", "==", application.jobId),
                where("applicantId", "==", application.applicantId)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                throw new Error("ALREADY_APPLIED");
            }

            const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), {
                ...application,
                appliedAt: Date.now(),
                status: 'pending'
            });
            return docRef.id;
        } catch (error) {
            console.error("Error applying to job:", error);
            throw error;
        }
    },

    getApplicationsForJob: async (jobId: string): Promise<JobApplication[]> => {
        try {
            const q = query(
                collection(db, APPLICATIONS_COLLECTION),
                where("jobId", "==", jobId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as JobApplication));
        } catch (error) {
            console.error("Error getting applications:", error);
            return [];
        }
    },

    // Get applications made by a specific teacher
    getApplicationsByUser: async (userId: string): Promise<JobApplication[]> => {
        try {
            const q = query(
                collection(db, APPLICATIONS_COLLECTION),
                where("applicantId", "==", userId)
            );
            const snapshot = await getDocs(q);
            // Sort client side or composite index
            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as JobApplication))
                .sort((a, b) => b.appliedAt - a.appliedAt);
        } catch (error) {
            console.error("Error getting user applications:", error);
            return [];
        }
    },

    updateApplicationStatus: async (appId: string, status: 'accepted' | 'rejected'): Promise<void> => {
        try {
            const appRef = doc(db, APPLICATIONS_COLLECTION, appId);
            await updateDoc(appRef, { status });
        } catch (error) {
            console.error("Error updating application status:", error);
            throw error;
        }
    },

    updateJob: async (jobId: string, updates: Partial<JobListing>): Promise<void> => {
        try {
            const jobRef = doc(db, JOBS_COLLECTION, jobId);
            await updateDoc(jobRef, updates);
        } catch (error) {
            console.error("Error updating job:", error);
            throw error;
        }
    }
};
