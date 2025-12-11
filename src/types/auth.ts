// old path: src/services/auth.ts
// new path: src/types/auth.ts
// Comentario: Tipos relacionados con la autenticación y la sesión del usuario.

export type Role = 'user' | 'admin';

export interface UserSession {
  uid: string;
  email: string;
  name?: string; // Añadido para que la sesión contenga el nombre del usuario desde el perfil.
  role: Role;
  profileComplete?: boolean;
}

/**
 * Define las preferencias de búsqueda de empleo de un usuario.
 * Renombrado de UserPreferences para mayor claridad.
 */
export interface JobSearchPreferences {
  keywords: string[];
  locations: string[];
  minSalary: number;
  experience?: 'Sin experiencia' | 'Junior' | 'Senior' | 'Lead';
}

/**
 * Define las preferencias de notificación de un usuario.
 */
export type NotificationFrequency = 'none' | 'daily' | 'weekly';
export type NotificationFormat = 'summary' | 'full';

export interface NotificationPreferences {
  inApp: boolean; // Recibir notificaciones en la app
  email: boolean; // Recibir notificaciones por correo
  frequency: NotificationFrequency; // Frecuencia de los correos
  format: NotificationFormat; // Formato del informe por correo
  maxJobs: number; // Cantidad máxima de trabajos a enviar
}

export type Screen =
  | 'user_home'
  | 'saved'
  | 'profile'
  | 'preferences'
  | 'notifications' // Corregido de 'notification_settings'
  | 'admin_dash';
