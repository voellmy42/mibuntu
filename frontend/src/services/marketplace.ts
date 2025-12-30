import { db } from '../firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy
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

    // Create a new job listing
    createJob: async (job: Omit<JobListing, 'id' | 'createdAt'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, JOBS_COLLECTION), {
                ...job,
                createdAt: Date.now() // Use server timestamp in real app, client TS for now
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
    }
};
