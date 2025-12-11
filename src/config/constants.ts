/**
 * Constantes globales de la aplicación
 * Ubicación centralizada para todas las constantes
 */

// Tipos de empleo
export const JOB_TYPES = [
  { label: 'Tiempo Completo', value: 'Full-time' },
  { label: 'Medio Tiempo', value: 'Part-time' },
  { label: 'Contrato', value: 'Contract' },
  { label: 'Temporal', value: 'Temporary' },
  { label: 'Pasantía', value: 'Internship' },
];

// Niveles de experiencia
export const EXPERIENCE_LEVELS = [
  { label: 'Sin experiencia', value: 'Sin experiencia' },
  { label: 'Junior (1-3 años)', value: 'Junior' },
  { label: 'Mid (3-7 años)', value: 'Mid' },
  { label: 'Senior (+7 años)', value: 'Senior' },
];

// Modalidades de trabajo
export const MODALITIES = [
  { label: 'Remoto', value: 'Remoto' },
  { label: 'Presencial', value: 'Presencial' },
  { label: 'Híbrido', value: 'Híbrido' },
];

// Configuración API
export const API_CONFIG = {
  JSEARCH_API_KEY: process.env.VITE_JSEARCH_API_KEY || '',
  GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || '',
  RESEND_API_KEY: process.env.VITE_RESEND_API_KEY || '',
};

// Límites y paginación
export const PAGINATION = {
  ITEMS_PER_PAGE: 12,
  MAX_ITEMS: 100,
};

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: '/admin',
  RECRUITER: '/recruiter',
};
