export interface JobListing {
    id?: string;
    userId: string; // The principal who posted it
    subject: string;
    school: string;
    location: string;
    startDate: string; // ISO date string or display string
    endDate?: string;
    days: string; // e.g. "Di & Do" or "100%"
    pay: string;
    urgent: boolean;
    description: string;
    createdAt: number;
    imageUrl?: string; // Optional cover image
}

export interface JobApplication {
    id?: string;
    jobId: string;
    applicantId: string; // The teacher's ID
    applicantName: string;
    message: string;
    appliedAt: number;
    status: 'pending' | 'accepted' | 'rejected';
}
