/**
 * Configuración centralizada de la aplicación
 * Variables de entorno y configuración por ambiente
 */

export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTesting: import.meta.env.MODE === 'test',
};

// Configuración de Firebase (se obtiene de variables de entorno)
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validar configuración de Firebase
export const validateFirebaseConfig = (): boolean => {
  const required = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  return required.every((key) => {
    const configKey = key as keyof typeof FIREBASE_CONFIG;
    return FIREBASE_CONFIG[configKey];
  });
};
