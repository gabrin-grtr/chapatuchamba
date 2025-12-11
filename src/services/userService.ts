// old path: src/services/jobStorageService.ts
// new path: src/services/userService.ts
// Comentario: Se ha extraído la lógica relacionada con la gestión de usuarios (perfiles, preferencias)
// del antiguo jobStorageService.ts para mejorar la cohesión y claridad.

import { collection, setDoc, doc, getDoc, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
import { db, collections } from '@/firebase/firebase';
import { Role, UserProfile, JobSearchPreferences, UserForAdmin } from '@/types';

/**
 * Servicio para interactuar con la colección de usuarios en Firestore.
 */
class UserService {
  /**
   * Guarda o actualiza el perfil de un estudiante y lo marca como completo.
   */
  async saveUserProfile(
    userId: string,
    profileData: Partial<Omit<UserProfile, 'uid'>>
  ): Promise<void> {
    try {
      if (!db) throw new Error('[FIREBASE] DB not initialized');
      const userDocRef = doc(db, collections.USERS, userId);
      await setDoc(
        userDocRef,
        {
          ...profileData,
          profileComplete: true,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error guardando el perfil del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene el perfil de un usuario desde Firestore.
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!db) {
        console.warn('[FIREBASE] DB not initialized - getUserProfile');
        return null;
      }
      const userDocRef = doc(db, collections.USERS, userId);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
      } else {
        console.log(`No profile found for user ${userId}`);
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo el perfil del usuario:', error);
      throw error;
    }
  }

  /**
   * Crea el documento de un nuevo usuario en Firestore.
   */
  async createUser(
    userId: string,
    email: string,
    profileData: Partial<Omit<UserProfile, 'uid'>>
  ): Promise<void> {
    try {
      if (!db) throw new Error('[FIREBASE] DB not initialized');
      const userDocRef = doc(db, collections.USERS, userId);

      const nameParts = profileData.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ');

      await setDoc(userDocRef, {
        email,
        role: 'user',
        profileComplete: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        firstName,
        lastName,
        ...profileData,
      });
    } catch (error) {
      console.error('Error creando el perfil del usuario:', error);
      throw error;
    }
  }

  /**
   * ADMIN: Actualiza el rol de un usuario específico.
   */
  async updateUserRole(userId: string, role: Role): Promise<void> {
    try {
      if (!db) throw new Error('[FIREBASE] DB not initialized');
      const userDocRef = doc(db, collections.USERS, userId);
      // Actualizamos solo el campo 'role'
      await updateDoc(userDocRef, { role });
      console.log(`Rol del usuario ${userId} actualizado a ${role}`);
    } catch (error) {
      console.error(`Error actualizando el rol para el usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene preferencias del usuario (obsoleto, usar getUserProfile)
   */
  async getUserPreferences(userId: string): Promise<JobSearchPreferences | null> {
    try {
      if (!db) {
        console.warn('[FIREBASE] DB not initialized - getUserPreferences');
        return null;
      }
      const docRef = doc(db, collections.USERS, userId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) return null;

      const data = snapshot.data();
      return {
        // Este método ahora es menos útil, es mejor obtener el perfil completo.
        ...data.jobPreferences,
      } as JobSearchPreferences;
    } catch (error) {
      console.error('Error obteniendo preferencias:', error);
      return null;
    }
  }

  /**
   * ADMIN: Obtiene una lista de todos los usuarios registrados.
   */
  async getAllUsers(): Promise<UserForAdmin[]> {
    try {
      if (!db) {
        console.warn('[FIREBASE] DB not initialized - getAllUsers');
        return [];
      }
      const usersCollectionRef = collection(db, collections.USERS);
      const snapshot = await getDocs(usersCollectionRef);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as UserForAdmin);
    } catch (error) {
      console.error('Error obteniendo todos los usuarios:', error);
      return [];
    }
  }

  /**
   * ADMIN: Elimina un usuario y todos sus datos asociados.
   * Esta operación DEBE ser manejada por una Cloud Function para asegurar la eliminación completa
   * y la seguridad. Esta es una función placeholder para la UI.
   * @param userId El ID del usuario a eliminar.
   */
  async deleteUserAdmin(userId: string): Promise<void> {
    console.warn(`La eliminación del usuario ${userId} debe ser manejada por una Cloud Function.`);
    throw new Error('La eliminación de usuarios no está implementada directamente en el cliente por seguridad y complejidad.');
  }
}

export const userService = new UserService();
