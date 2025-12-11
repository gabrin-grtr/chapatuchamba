import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthContext.tsx'; // Importa el AuthProvider
import './index.css';

// --- PASO DE DEPURACIÓN ---
// Imprime todas las variables de entorno que Vite está cargando.
console.log('[DEBUG] Variables de entorno cargadas por Vite:', import.meta.env);

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
} else {
  console.error("CRÍTICO: No se encontró el elemento con id 'root' en el HTML.");
}
