import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { useState, useEffect } from 'react';
import { UserSession } from '@/types';
import { userService } from '@/services/userService'; // Importado para leer el perfil de usuario desde Firestore.

// --- Tipos de Datos Compartidos ---

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: {
    min?: number; // Hacemos min opcional para coincidir con functions/src/utils/types.ts
    max?: number; // Hacemos max opcional para coincidir con functions/src/utils/types.ts
    currency: string;
  };
  description?: string;
  jobUrl: string;
  postedAt?: Date;
  employmentType?: string;
  skills?: string[];
  /** Campo interno para optimizar búsquedas. Contiene un array de palabras clave en minúsculas. */
  _searchKeywords?: string[];
}

// Las credenciales de Firebase ahora se cargan desde variables de entorno
// para mayor seguridad, usando el prefijo VITE_ como requiere Vite.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa Firebase solo si no ha sido inicializado antes.
// Esto previene errores durante el Hot Module Replacement (HMR) en desarrollo.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

/**
 * Hook personalizado para gestionar el estado de autenticación de Firebase.
 * Proporciona la sesión del usuario actual, el estado de carga y funciones para iniciar/cerrar sesión.
 */
export const useFirebaseAuth = () => {
  const [currentUserSession, setCurrentUserSession] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // Al detectar un usuario autenticado, buscamos su perfil en Firestore
        // para obtener su rol y otros datos. Esto unifica la lógica de sesión
        // con la lógica de registro en `LoginScreen.tsx`.
        const userProfile = await userService.getUserProfile(user.uid);
        
        if (userProfile) {
          console.log(`[AUTH] Sesión hidratada para ${userProfile.email}, rol: ${userProfile.role}`);
          setCurrentUserSession({
            uid: user.uid,
            email: user.email || '',
            name: userProfile.name,
            role: userProfile.role || 'user', // Aseguramos un rol por defecto si no está en el perfil.
          });
        } else {
          // Este caso ocurre si un usuario está en Firebase Auth pero no tiene un
          // documento de perfil en Firestore (p. ej., si la creación del perfil falló).
          // Para evitar un estado inconsistente, cerramos su sesión.
          console.error(
            `[AUTH] Error: Usuario autenticado con UID ${user.uid} pero sin perfil en Firestore. Cerrando sesión.`
          );
          signOut(auth);
          setCurrentUserSession(null);
        }
      } else {
        console.log('[AUTH] No se detectó ningún usuario.');
        setCurrentUserSession(null);
      }
      setAuthLoading(false);
    });

    // Limpiar la suscripción al desmontar el componente para evitar fugas de memoria.
    return () => unsubscribe();
  }, []);

  const userLogout = () => signOut(auth);

  // La función `userLogin` fue eliminada porque usaba datos simulados y es obsoleta.
  // El inicio de sesión real ahora se gestiona directamente en `LoginScreen.tsx`.
  return { currentUserSession, authLoading, userLogout };
};

/**
 * Nombres de las colecciones principales en Firestore.
 */
export const collections = {
  JOBS: 'jobs',
  USERS: 'users',
};

/**
 * Devuelve la ruta a una colección pública.
 * @param collectionName El nombre de la colección.
 * @returns La ruta completa de la colección.
 */
export const getPublicCollectionPath = (collectionName: string): string => {
  return collectionName;
};

/**
 * Devuelve la ruta a una subcolección privada de un usuario.
 * @param userId El ID del usuario.
 * @param collectionName El nombre de la subcolección.
 * @returns La ruta completa de la subcolección.
 */
export const getPrivateCollectionPath = (userId: string, collectionName: string): string => {
  return `users/${userId}/${collectionName}`;
};

export default app;
