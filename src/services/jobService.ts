// old path: src/services/jobStorageService.ts
// new path: src/services/jobService.ts
// Comentario: Se ha extraído la lógica relacionada con la gestión de trabajos (ofertas, guardados, búsquedas)
// del antiguo jobStorageService.ts para mejorar la cohesión y claridad.

import {
  collection,
  setDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  Timestamp,
  documentId,
  onSnapshot,
  writeBatch,
  QueryConstraint,
} from 'firebase/firestore';
import { db, collections, JobListing } from '@/firebase/firebase';
import { SavedJob, UserNotification } from '@/types';

/**
 * Servicio para interactuar con las colecciones de trabajos en Firestore.
 */
class JobService {
  /**
   * Guarda una referencia a una oferta de trabajo para un usuario.
   */
  async saveJob(job: JobListing, userId: string, notes?: string): Promise<string> {
    try {
      if (!db) throw new Error('[FIREBASE] DB not initialized');
      const savedJobRef = doc(collection(db, `users/${userId}/saved_jobs`));
      await setDoc(savedJobRef, {
        jobId: job.id, // Referencia al ID del documento en la colección 'jobs'
        userId,
        savedAt: Timestamp.now(),
        notes: notes || '',
      });
      return savedJobRef.id;
    } catch (error) {
      console.error('Error guardando oferta:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las ofertas guardadas de un usuario, realizando un "join"
   * con la colección principal de trabajos.
   */
  async getSavedJobs(userId: string): Promise<SavedJob[]> {
    try {
      if (!db) {
        console.warn('[FIREBASE] DB not initialized - getSavedJobs');
        return [];
      }
      // 1. Obtener las referencias de los trabajos guardados por el usuario
      const q = query(collection(db, `users/${userId}/saved_jobs`), orderBy('savedAt', 'desc'));
      const savedJobsSnapshot = await getDocs(q);
      const savedJobsData = savedJobsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          jobId: data.jobId,
          userId: data.userId,
          notes: data.notes,
          savedAt: data.savedAt as Timestamp, // Keep as Timestamp temporarily
        };
      });

      if (savedJobsData.length === 0) return [];

      // 2. Obtener los detalles completos de los trabajos desde la colección 'jobs'
      const jobIds = savedJobsData.map((ref) => ref.jobId);
      const jobsQuery = query(collection(db, collections.JOBS), where(documentId(), 'in', jobIds));
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobsMap = new Map(
        jobsSnapshot.docs.map((doc) => {
          const data = doc.data();
          const postedAt = data.postedAt instanceof Timestamp ? data.postedAt.toDate() : data.postedAt;
          const jobListing: JobListing = { ...data, id: doc.id, postedAt } as JobListing;
          return [doc.id, jobListing];
        })
      );

      // 3. Combinar los datos
      const savedJobs: SavedJob[] = savedJobsData
        .map((savedData) => {
          const jobDetails = jobsMap.get(savedData.jobId);
          return jobDetails
            ? ({
                id: savedData.id,
                jobId: savedData.jobId,
                userId: savedData.userId,
                notes: savedData.notes,
                savedAt: savedData.savedAt.toDate(), // Convert Timestamp to Date here
                job: jobDetails,
              } as SavedJob)
            : null;
        })
        .filter((job): job is SavedJob => job !== null);

      return savedJobs;
    } catch (error) {
      console.error('Error obteniendo ofertas guardadas:', error);
      return [];
    }
  }

  /**
   * Obtiene una oferta guardada específica.
   */
  async getSavedJob(savedJobId: string, userId: string): Promise<SavedJob | null> {
    try {
      if (!db) {
        console.warn('[FIREBASE] DB not initialized - getSavedJob');
        return null;
      }
      const savedJobRef = doc(db, `users/${userId}/saved_jobs`, savedJobId);
      const savedJobSnap = await getDoc(savedJobRef);

      if (!savedJobSnap.exists()) return null;
      const savedJobData = savedJobSnap.data();

      const jobRef = doc(db, collections.JOBS, savedJobData.jobId);
      const jobSnap = await getDoc(jobRef);
      if (jobSnap.exists()) {
        const jobData = jobSnap.data();
        const postedAt =
          jobData.postedAt instanceof Timestamp ? jobData.postedAt.toDate() : jobData.postedAt;
        const jobDetails: JobListing = { ...jobData, id: jobSnap.id, postedAt } as JobListing;
        return {
          id: savedJobSnap.id,
          jobId: savedJobData.jobId,
          userId: savedJobData.userId,
          notes: savedJobData.notes,
          savedAt: (savedJobData.savedAt as Timestamp).toDate(),
          job: jobDetails,
        } as SavedJob;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo oferta:', error);
      return null;
    }
  }

  /**
   * Se suscribe en tiempo real a las notificaciones de un usuario.
   * @param userId El ID del usuario.
   * @param callback La función que se ejecutará con la lista de notificaciones.
   * @returns Una función para cancelar la suscripción.
   */
  listenToUserNotifications(userId: string, callback: (notifications: UserNotification[]) => void): () => void {
    if (!db) {
      console.warn('[FIREBASE] DB not initialized - listenToUserNotifications');
      return () => {}; // Devuelve una función vacía si no hay DB
    }
    const q = query(collection(db, `users/${userId}/notifications`), orderBy('createdAt', 'desc'), limit(20));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
          } as UserNotification;
        });
        callback(notifications);
      },
      (error) => {
        console.error('Error en el listener de notificaciones:', error);
      }
    );

    return unsubscribe; // Devuelve la función para desuscribirse
  }

  /**
   * Marca una notificación específica como leída.
   * @param userId El ID del usuario.
   * @param notificationId El ID de la notificación.
   */
  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      if (!db) throw new Error('[FIREBASE] DB not initialized');
      const notificationRef = doc(db, `users/${userId}/notifications`, notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marca todas las notificaciones no leídas de un usuario como leídas.
   * @param userId El ID del usuario.
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      if (!db) throw new Error('[FIREBASE] DB not initialized');
      const notificationsQuery = query(
        collection(db, `users/${userId}/notifications`),
        where('read', '==', false)
      );
      const snapshot = await getDocs(notificationsQuery);

      if (snapshot.empty) {
        return;
      }

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  /**
   * Elimina una oferta guardada
   */
  async removeSavedJob(savedJobId: string, userId: string): Promise<void> {
    try {
      if (!db) throw new Error('[FIREBASE] DB not initialized');
      await deleteDoc(doc(db, `users/${userId}/saved_jobs`, savedJobId));
    } catch (error) {
      console.error('Error eliminando oferta guardada:', error);
      throw error;
    }
  }

  /**
   * Actualiza notas de una oferta
   */
  async updateJobNotes(savedJobId: string, userId: string, notes: string): Promise<void> {
    try {
      if (!db) throw new Error('[FIREBASE] DB not initialized');
      const docRef = doc(db, `users/${userId}/saved_jobs`, savedJobId);
      await updateDoc(docRef, { notes });
    } catch (error) {
      console.error('Error actualizando notas:', error);
      throw error;
    }
  }

  /**
   * Busca ofertas en la colección central 'jobs' de Firestore.
   */
  async searchJobs(
    filters: {
      keyword?: string;
      location?: string;
      minSalary?: number;
    } = {},
    pageLimit: number = 20
  ): Promise<JobListing[]> {
    try {
      if (!db) return [];

      const constraints: QueryConstraint[] = [];

      const allKeywords = `${filters.keyword || ''} ${filters.location || ''}`
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter((kw) => kw.length > 0);

      if (allKeywords.length > 0) {
        allKeywords.slice(0, 10).forEach((keyword) => {
          constraints.push(where('_searchKeywords', 'array-contains', keyword));
        });
      }

      if (filters.minSalary) {
        constraints.push(where('salary.min', '>=', filters.minSalary));
      }

      constraints.push(orderBy('postedAt', 'desc'), limit(pageLimit));

      const q = query(collection(db, collections.JOBS), ...constraints);
      const snapshot = await getDocs(q);
      const jobs = snapshot.docs.map((doc) => {
        const data = doc.data();
        const postedAt =
          data.postedAt instanceof Timestamp ? data.postedAt.toDate() : data.postedAt;
        return {
          id: doc.id,
          ...data,
          postedAt,
        } as JobListing;
      });

      return jobs;
    } catch (error) {
      console.error('Error buscando ofertas:', error);
      return [];
    }
  }

  /**
   * ADMIN: Obtiene una lista completa de todas las ofertas de trabajo.
   * @returns Una promesa que resuelve con un array de JobListing.
   */
  async getAllJobsAdmin(): Promise<JobListing[]> {
    try {
      if (!db) {
        console.warn('[FIREBASE] DB not initialized - getAllJobsAdmin');
        return [];
      }
      const jobsCollectionRef = collection(db, collections.JOBS);
      const snapshot = await getDocs(jobsCollectionRef);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const postedAt = data.postedAt instanceof Timestamp ? data.postedAt.toDate() : data.postedAt;
        return {
          id: doc.id,
          ...data,
          postedAt,
        } as JobListing;
      });
    } catch (error) {
      console.error('Error obteniendo todas las ofertas de trabajo (Admin):', error);
      return [];
    }
  }

  /**
   * ADMIN: Actualiza el estado de una oferta de trabajo.
   * @param jobId El ID de la oferta de trabajo.
   * @param status El nuevo estado ('active' | 'inactive' | 'expired').
   */
  async updateJobStatus(jobId: string, status: 'active' | 'inactive' | 'expired'): Promise<void> {
    try {
      if (!db) throw new Error('[FIREBASE] DB not initialized');
      const jobRef = doc(db, collections.JOBS, jobId);
      await updateDoc(jobRef, { status });
      console.log(`Estado del trabajo ${jobId} actualizado a ${status}`);
    } catch (error) {
      console.error(`Error actualizando el estado del trabajo ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * ADMIN: Elimina una oferta de trabajo.
   * @param jobId El ID de la oferta de trabajo a eliminar.
   */
  async deleteJobAdmin(jobId: string): Promise<void> {
    try {
      if (!db) throw new Error('[FIREBASE] DB not initialized');
      // Eliminar el documento de la colección principal de trabajos
      await deleteDoc(doc(db, collections.JOBS, jobId));
      console.log(`Trabajo ${jobId} eliminado de la colección principal.`);
      // NOTE: Fan-out deletion to remove saved_jobs references should be handled by a Cloud Function.
    } catch (error) {
      console.error(`Error eliminando el trabajo ${jobId}:`, error);
      throw error;
    }
  }
}

export const jobService = new JobService();