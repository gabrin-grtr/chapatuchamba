// old path: src/services/job.ts
// new path: src/types/job.ts
// Comentario: Tipos relacionados con las ofertas de trabajo y aplicaciones.

import { Timestamp } from 'firebase/firestore';
import { JobListing } from '@/firebase/firebase';

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  companyName?: string;
  location: string;
  salary?: { min: number; max: number; currency: string };
  salaryMin?: number;
  salaryMax?: number;
  description?: string;
  contractType?:
    | 'Full-time'
    | 'Part-time'
    | 'Contract'
    | 'Temporary'
    | 'Internship'
    | 'full-time'
    | 'part-time';
  postedBy?: string;
  postedAt?: string;
  postedDate?: Date;
  keywords?: string[];
  skills?: string[];
  tags?: string[];
  source: string;
  jobUrl?: string;
  sourceId?: string;
  cvUrl?: string;
  uploadedAt?: Date;
}

export interface SavedJob {
  id: string;
  jobId: string;
  userId: string;
  job: JobListing;
  savedAt: Date;
  notes?: string;
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  applicationDate: number;
  status: 'Applied' | 'Reviewing' | 'Interview' | 'Rejected' | 'Hired';
  applicantName: string;
  applicantEmail: string;
  cvReference: string;
}

export interface EmailHistoryLog {
  id: string;
  userId: string;
  jobIds: string[];
  status: 'sent' | 'failed';
  messageId?: string;
  sentAt: Timestamp;
}
