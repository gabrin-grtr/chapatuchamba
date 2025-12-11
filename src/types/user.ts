import { Role, JobSearchPreferences, NotificationPreferences } from './auth';

/**
 * Representa el perfil de un usuario tal como se almacena en la colección `users` de Firestore.
 * Consolidado desde `src/screens/auth/user.ts`.
 */
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: Role;
  photoURL?: string;
  jobPreferences?: JobSearchPreferences;
  notificationPreferences?: NotificationPreferences;
  // Campos adicionales del perfil de usuario
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  age?: number;
  headline?: string; // También usado como 'bio'
  skills?: string[];
  profileComplete?: boolean;
}

/**
 * Representa la vista de un usuario para un administrador, incluyendo el ID del documento.
 * Utilizado en las pantallas de administración.
 */
export interface UserForAdmin extends UserProfile {
  id: string;
}

/**
 * Representa una notificación que se muestra al usuario dentro de la aplicación.
 * Este tipo se utiliza en el frontend.
 */
export interface UserNotification {
  id: string;
  jobId: string;
  title: string;
  company: string;
  read: boolean;
  createdAt: Date; // Convertido desde Firestore Timestamp para su uso en el frontend
}