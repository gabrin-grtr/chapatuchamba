import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  CollectionReference,
  doc,
  setDoc,
  onSnapshot,
  addDoc,
  writeBatch,
  query,
  orderBy,
  getDocs,
  QueryConstraint,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { signOut } from 'firebase/auth';

import {
  db,
  auth,
  storage,
  getPublicCollectionPath,
  getPrivateCollectionPath,
} from '@/firebase/firebase';
import { JobOffer, UserPreferences, JobReport, Role, UserSession, UserProfile } from '@/types';
import { SEED_JOBS } from '@/data/seedData';

interface JobFilters {
  keyword: string;
  location: string;
  contractType?: JobOffer['contractType'];
  minSalary?: number;
}

interface LocalUserData {
  savedJobs?: string[];
  preferences?: UserPreferences;
  profile?: UserProfile;
}

interface JobContextType {
  jobs: JobOffer[];
  savedJobs: string[];
  preferences: UserPreferences;
  studentProfile: UserProfile | null;
  userRole: Role;
  user: UserSession | null;
  isLoading: boolean;
  isJobsLoading: boolean;

  toggleSaveJob: (jobId: string) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  addNewJob: (job: Omit<JobOffer, 'id' | 'postedAt'>) => Promise<void>;
  updateStudentProfile: (profile: Partial<Omit<UserProfile, 'uid'>>) => Promise<void>;
  uploadCV: (file: File) => Promise<string | null>;
  deleteCV: () => Promise<void>;
  deleteUserAccount: () => Promise<void>;

  currentFilters: JobFilters;
  setSearchFilters: (filters: JobFilters) => void;
  fetchJobs: (filters: JobFilters) => Promise<void>;
  generateReport: () => JobReport;
  sendEmailReport: () => Promise<boolean>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

interface JobProviderProps {
  children: ReactNode;
  currentUserSession: UserSession | null;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children, currentUserSession }) => {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    keywords: [],
    minSalary: 0,
    locations: [],
    jobTypes: [],
    emailFrequency: 'weekly',
    sectorGeneral: 'Tecnología',
    experience: 'Sin experiencia',
    modality: 'Remoto',
  });
  const [studentProfile, setStudentProfile] = useState<UserProfile | null>(null);
  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<JobFilters>({ keyword: '', location: '' });

  const seedDatabase = async (jobsRef: CollectionReference) => {
    if (!db) return;
    try {
      // Use addDoc to ensure documents are created with unique IDs
      for (const job of SEED_JOBS) {
        try {
          await addDoc(jobsRef, { ...job, postedAt: new Date().toISOString() });
        } catch (e) {
          console.error('Error adding seed job', e);
        }
      }
      console.log('Database seeded successfully with initial job data.');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  };

  const localStorageKey = (userId: string) => `ctc_local_user_${userId}`;

  const readLocalData = (userId: string): LocalUserData | null => {
    try {
      const raw =
        typeof window !== 'undefined' ? localStorage.getItem(localStorageKey(userId)) : null;
      if (!raw) return null;
      return JSON.parse(raw) as LocalUserData;
    } catch (e) {
      console.error('Error reading local data', e);
      return null;
    }
  };

  const writeLocalData = (userId: string, data: LocalUserData) => {
    try {
      if (typeof window !== 'undefined')
        localStorage.setItem(localStorageKey(userId), JSON.stringify(data));
    } catch (e) {
      console.error('Error writing local data', e);
    }
  };

  const fetchJobs = async (filters: JobFilters) => {
    if (!db) {
      // Firestore not available (local dev). Use seed data to populate jobs so UI can function offline.
      setIsJobsLoading(true);
      setCurrentFilters(filters);
      try {
        const seeded = SEED_JOBS.map((j, idx) => ({ id: `seed-${idx}`, ...j }) as JobOffer);
        const filteredJobs = seeded.filter(
          (job) =>
            (!filters.keyword ||
              job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
              job.companyName.toLowerCase().includes(filters.keyword.toLowerCase()) ||
              job.description.toLowerCase().includes(filters.keyword.toLowerCase())) &&
            (!filters.location ||
              job.location.toLowerCase().includes(filters.location.toLowerCase()))
        );
        setJobs(filteredJobs);
      } catch (e) {
        console.error('Error loading seed jobs locally:', e);
      } finally {
        setIsJobsLoading(false);
      }
      return;
    }
    setIsJobsLoading(true);
    setCurrentFilters(filters);
    const jobCollectionPath = getPublicCollectionPath('jobs');
    const jobsRef = collection(db, jobCollectionPath);
    const constraints: QueryConstraint[] = [orderBy('postedAt', 'desc')];
    try {
      const q = query(jobsRef, ...constraints);
      const snapshot = await getDocs(q);
      const fetchedJobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as JobOffer);
      const filteredJobs = fetchedJobs.filter(
        (job) =>
          (!filters.keyword ||
            job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
            job.companyName.toLowerCase().includes(filters.keyword.toLowerCase()) ||
            job.description.toLowerCase().includes(filters.keyword.toLowerCase())) &&
          (!filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase()))
      );
      setJobs(filteredJobs);
      if (snapshot.empty) {
        await seedDatabase(jobsRef);
        // re-run query after seeding
        const snapshot2 = await getDocs(q);
        const fetchedJobs2 = snapshot2.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as JobOffer
        );
        const filteredJobs2 = fetchedJobs2.filter(
          (job) =>
            (!filters.keyword ||
              job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
              job.companyName.toLowerCase().includes(filters.keyword.toLowerCase()) ||
              job.description.toLowerCase().includes(filters.keyword.toLowerCase())) &&
            (!filters.location ||
              job.location.toLowerCase().includes(filters.location.toLowerCase()))
        );
        setJobs(filteredJobs2);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsJobsLoading(false);
    }
  };

  useEffect(() => {
    // When user changes, load their preferences/profile from Firestore if available,
    // otherwise use localStorage for simulation.
    if (!currentUserSession) {
      setSavedJobs([]);
      setStudentProfile(null);
      setPreferences((prev) => ({ ...prev, minSalary: 0 }));
      setIsUserLoading(false);
      return;
    }

    const userId = currentUserSession.uid;
    if (!db) {
      // load from local storage
      const local: LocalUserData = readLocalData(userId) || {};
      setSavedJobs(local.savedJobs || []);
      setStudentProfile(
        local.profile || {
          uid: userId,
          name: currentUserSession.email.split('@')[0] || 'Nuevo Candidato',
          headline: 'Busco mi primera oportunidad profesional.',
          skills: ['Comunicación', 'Trabajo en equipo'],
          education: [],
          cvUrl: null,
        }
      );
      setPreferences(
        local.preferences || {
          keywords: [],
          minSalary: 0,
          locations: ['Remoto'],
          jobTypes: ['Full-time'],
          emailFrequency: 'weekly',
          sectorGeneral: 'Tecnología',
          experience: 'Junior',
          modality: 'Híbrido',
        }
      );
      setIsUserLoading(false);
      return;
    }

    const userDocPath = getPrivateCollectionPath(userId, 'userData');
    const userPrefsDocRef = doc(db, userDocPath, 'preferences');
    const profileDocRef = doc(db, userDocPath, 'profile');

    const unsubscribePrefs = onSnapshot(
      userPrefsDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data.savedJobs) setSavedJobs(data.savedJobs);
          if (data.preferences) setPreferences((prev) => ({ ...prev, ...data.preferences }));
        } else {
          const defaultPrefs: Partial<UserPreferences> = {
            keywords: [],
            minSalary: 0,
            locations: ['Remoto'],
            jobTypes: ['Full-time'],
            emailFrequency: 'weekly',
            sectorGeneral: 'Tecnología',
            experience: 'Junior',
            modality: 'Híbrido',
          };
          setDoc(
            userPrefsDocRef,
            { savedJobs: [], preferences: defaultPrefs },
            { merge: true }
          ).catch((e) => console.error('Error creating default user prefs:', e));
        }
      },
      (error) => {
        console.error('Error listening to user preferences:', error);
      }
    );
    const unsubscribeProfile = onSnapshot(
      profileDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setStudentProfile(docSnapshot.data() as UserProfile);
        } else {
          const defaultProfile: UserProfile = {
            uid: userId,
            name: currentUserSession.email.split('@')[0] || 'Nuevo Candidato',
            headline: 'Busco mi primera oportunidad profesional.',
            skills: ['Comunicación', 'Trabajo en equipo'],
            education: [],
            cvUrl: null,
          };
          setDoc(profileDocRef, defaultProfile, { merge: true }).catch((e) =>
            console.error('Error creating default student profile:', e)
          );
          setStudentProfile(defaultProfile);
        }
        setIsUserLoading(false);
      },
      (error) => {
        console.error('Error listening to student profile:', error);
        setIsUserLoading(false);
      }
    );

    return () => {
      unsubscribePrefs();
      unsubscribeProfile();
    };
  }, [currentUserSession]);

  useEffect(() => {
    fetchJobs(currentFilters);
  }, [currentUserSession?.uid]);

  const setSearchFilters = (filters: JobFilters) => {
    fetchJobs(filters);
  };

  const toggleSaveJob = async (jobId: string) => {
    if (!currentUserSession) return;
    const userId = currentUserSession.uid;
    const newSaved = savedJobs.includes(jobId)
      ? savedJobs.filter((id) => id !== jobId)
      : [...savedJobs, jobId];
    setSavedJobs(newSaved);
    if (!db) {
      // persist locally
      const local = readLocalData(userId) || {};
      local.savedJobs = newSaved;
      writeLocalData(userId, local);
      return;
    }
    const userRef = doc(db, getPrivateCollectionPath(userId, 'userData'), 'preferences');
    try {
      await setDoc(userRef, { savedJobs: newSaved }, { merge: true });
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };
  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!currentUserSession) return;
    const userId = currentUserSession.uid;
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    if (!db) {
      const local = readLocalData(userId) || {};
      local.preferences = updated;
      writeLocalData(userId, local);
      return;
    }
    const userRef = doc(db, getPrivateCollectionPath(userId, 'userData'), 'preferences');
    try {
      await setDoc(userRef, { preferences: updated }, { merge: true });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };
  const addNewJob = async (newJobData: Omit<JobOffer, 'id' | 'postedAt'>) => {
    if (!currentUserSession) return;
    if (currentUserSession.role !== 'recruiter' && currentUserSession.role !== 'admin') return;
    if (!db) {
      // local simulation: prepend to jobs list
      const newJob: JobOffer = {
        id: `local-${Date.now()}`,
        ...newJobData,
        postedAt: new Date().toISOString(),
      };
      setJobs((prev) => [newJob, ...prev]);
      return;
    }
    const jobsCollectionPath = getPublicCollectionPath('jobs');
    const jobsRef = collection(db, jobsCollectionPath);
    try {
      await addDoc(jobsRef, {
        ...newJobData,
        postedBy: currentUserSession.uid,
        postedAt: new Date().toISOString(),
      });
      console.log(`Nueva oferta publicada por ${currentUserSession.uid}`);
    } catch (error) {
      console.error('Error adding new job:', error);
    }
  };

  const uploadCV = async (file: File): Promise<string | null> => {
    if (!currentUserSession) {
      console.error('User not logged in.');
      return null;
    }
    const userId = currentUserSession.uid;
    if (!storage) {
      const simulatedUrl = `https://local.fake.storage/${userId}/cv_${Date.now()}.pdf`;
      await updateStudentProfile({ cvUrl: simulatedUrl });
      return simulatedUrl;
    }
    const cvRef = storageRef(storage, `cvs/${userId}/cv_${Date.now()}.pdf`);
    try {
      const snapshot = await uploadBytes(cvRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await updateStudentProfile({ cvUrl: downloadURL });
      return downloadURL;
    } catch (error) {
      console.error('Error uploading CV:', error);
      return null;
    }
  };

  const deleteCV = async () => {
    if (!currentUserSession || !studentProfile || !studentProfile.cvUrl) return;
    if (!storage) {
      await updateStudentProfile({ cvUrl: null });
      return;
    }
    try {
      const fileRef = storageRef(storage, studentProfile.cvUrl);
      await deleteObject(fileRef);
      await updateStudentProfile({ cvUrl: null });
      console.log('CV deleted successfully.');
    } catch (error) {
      console.error('Error deleting CV:', error);
    }
  };

  const updateStudentProfile = async (profileUpdate: Partial<Omit<UserProfile, 'uid'>>) => {
    if (!currentUserSession) return;
    const userId = currentUserSession.uid;
    const updated = studentProfile
      ? ({ ...studentProfile, ...profileUpdate } as UserProfile)
      : ({ uid: userId, ...profileUpdate } as UserProfile);
    setStudentProfile(updated);
    if (!db) {
      const local = readLocalData(userId) || {};
      local.profile = updated;
      writeLocalData(userId, local);
      return;
    }
    const userDocPath = getPrivateCollectionPath(userId, 'userData');
    const profileDocRef = doc(db, userDocPath, 'profile');
    try {
      await setDoc(profileDocRef, profileUpdate, { merge: true });
      setStudentProfile((prev) =>
        prev ? ({ ...prev, ...profileUpdate } as UserProfile) : null
      );
    } catch (error) {
      console.error('Error updating student profile:', error);
    }
  };

  const deleteUserAccount = async () => {
    if (!currentUserSession) return;
    const userId = currentUserSession.uid;
    try {
      if (studentProfile?.cvUrl) {
        await deleteCV();
      }
      if (!db) {
        try {
          if (typeof window !== 'undefined') localStorage.removeItem(localStorageKey(userId));
        } catch (e) {
          console.warn('Could not remove localStorage key for user', userId, e);
        }
        setStudentProfile(null);
        setSavedJobs([]);
        setPreferences((prev) => ({ ...prev, minSalary: 0 }));
        return;
      }
      const batch = writeBatch(db);
      const userDocPath = getPrivateCollectionPath(userId, 'userData');
      batch.delete(doc(db, userDocPath, 'preferences'));
      batch.delete(doc(db, userDocPath, 'profile'));
      await batch.commit();
      await signOut(auth);
    } catch (error) {
      console.error('Error deleting user account:', error);
    }
  };

  const generateReport = (): JobReport => {
    if (jobs.length === 0)
      return {
        totalJobs: 0,
        avgSalary: 0,
        topSkills: [],
        jobsBySource: [],
        generatedAt: new Date().toISOString(),
      };
    const validSalaries = jobs.filter((j) => j.salaryMin > 0 && j.salaryMax > 0);
    const avgSalary = validSalaries.length
      ? Math.round(
          validSalaries.reduce((acc, j) => acc + (j.salaryMin + j.salaryMax) / 2, 0) /
            validSalaries.length
        )
      : 0;
    const skillCounts: Record<string, number> = {};
    jobs.forEach((j) => j.tags?.forEach((t) => (skillCounts[t] = (skillCounts[t] || 0) + 1)));
    const topSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    const sourceCounts: Record<string, number> = {};
    jobs.forEach(
      (j) =>
        (sourceCounts[j.source || 'Publicado'] = (sourceCounts[j.source || 'Publicado'] || 0) + 1)
    );
    return {
      totalJobs: jobs.length,
      avgSalary,
      topSkills,
      jobsBySource: Object.entries(sourceCounts).map(([source, count]) => ({
        source,
        count: count,
      })),
      generatedAt: new Date().toISOString(),
    };
  };

  const sendEmailReport = async (): Promise<boolean> => {
    if (!currentUserSession) return false;
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(true);
      }, 2000)
    );
  };

  const value = {
    jobs,
    savedJobs,
    preferences,
    studentProfile,
    user: currentUserSession,
    userRole: currentUserSession?.role || null,
    isLoading: isJobsLoading || isUserLoading,
    isJobsLoading,
    toggleSaveJob,
    updatePreferences,
    addNewJob,
    updateStudentProfile,
    uploadCV,
    deleteCV,
    deleteUserAccount,
    currentFilters,
    setSearchFilters,
    fetchJobs,
    generateReport,
    sendEmailReport,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error('useJobs must be used within a JobProvider');
  return context;
};
