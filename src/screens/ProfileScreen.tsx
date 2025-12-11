import React, { useState, useEffect, useCallback } from 'react';
import { useFirebaseAuth } from '@/firebase/firebase';
import { userService } from '@/services/userService';
import {
  UserProfile,
  JobSearchPreferences,
  NotificationPreferences,
  NotificationFrequency,
} from '@/types';

// Define estados por defecto para las preferencias en caso de que un usuario aún no las tenga.
const defaultJobPrefs: JobSearchPreferences = { keywords: [], locations: [], minSalary: 0 };
const defaultNotifPrefs: NotificationPreferences = {
  inApp: true,
  email: true,
  frequency: 'daily',
  format: 'summary',
  maxJobs: 5,
};

/**
 * Pantalla donde el usuario puede ver y editar su perfil,
 * así como sus preferencias de búsqueda y notificación.
 */
const ProfileScreen: React.FC = () => {
  const { currentUserSession } = useFirebaseAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Carga el perfil del usuario cuando el componente se monta o la sesión cambia.
  const fetchProfile = useCallback(async () => {
    if (currentUserSession) {
      setIsLoading(true);
      const userProfile = await userService.getUserProfile(currentUserSession.uid);
      if (userProfile) {
        // Asegura que los objetos de preferencias existan para evitar errores en el formulario.
        setProfile({
          ...userProfile,
          jobPreferences: userProfile.jobPreferences || defaultJobPrefs,
          notificationPreferences: userProfile.notificationPreferences || defaultNotifPrefs,
        });
      }
      setIsLoading(false);
    }
  }, [currentUserSession]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Manejador para guardar todos los cambios realizados en el perfil.
  const handleSave = async () => {
    if (currentUserSession && profile) {
      setStatusMessage('Guardando...');
      try {
        // Prepara el objeto con todos los datos a guardar.
        const profileToSave: Partial<UserProfile> = {
          name: profile.name,
          jobPreferences: profile.jobPreferences || defaultJobPrefs,
          notificationPreferences: profile.notificationPreferences || defaultNotifPrefs,
        };
        // Llama a un único método para una escritura eficiente en la base de datos.
        await userService.saveUserProfile(currentUserSession.uid, profileToSave);
        setStatusMessage('¡Perfil guardado con éxito!');
      } catch (error) {
        console.error('Error guardando el perfil:', error);
        setStatusMessage('Error al guardar el perfil.');
      }
      // Limpia el mensaje de estado después de 3 segundos.
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  if (isLoading) {
    return <div>Cargando perfil...</div>;
  }

  if (!profile) {
    return <div>No se pudo cargar el perfil del usuario.</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Mi Perfil</h1>

      {/* --- Sección de Información Personal --- */}
      <section>
        <h2>Información Personal</h2>
        <label htmlFor="name">Nombre:</label>
        <input
          type="text"
          id="name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          style={{ width: '300px', marginLeft: '10px' }}
        />
      </section>

      {/* --- Sección de Preferencias de Notificación --- */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Preferencias de Notificación</h2>
        <div>
          <input
            type="checkbox"
            id="email-notif"
            checked={profile.notificationPreferences?.email}
            onChange={(e) =>
              setProfile({
                ...profile,
                notificationPreferences: { ...profile.notificationPreferences!, email: e.target.checked },
              })
            }
          />
          <label htmlFor="email-notif">Recibir informes por correo electrónico</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="inapp-notif"
            checked={profile.notificationPreferences?.inApp}
            onChange={(e) =>
              setProfile({
                ...profile,
                notificationPreferences: { ...profile.notificationPreferences!, inApp: e.target.checked },
              })
            }
          />
          <label htmlFor="inapp-notif">Recibir notificaciones en la app</label>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label htmlFor="frequency">Frecuencia de correos:</label>
          <select
            id="frequency"
            value={profile.notificationPreferences?.frequency}
            onChange={(e) =>
              setProfile({
                ...profile,
                notificationPreferences: {
                  ...profile.notificationPreferences!,
                  frequency: e.target.value as NotificationFrequency,
                },
              })
            }
            style={{ marginLeft: '10px' }}
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="none">Nunca</option>
          </select>
        </div>
      </section>

      {/* --- Sección de Preferencias de Trabajo --- */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Preferencias de Trabajo</h2>
        <label htmlFor="keywords">Palabras clave (separadas por coma):</label>
        <input
          type="text"
          id="keywords"
          value={(profile.jobPreferences?.keywords || []).join(', ')}
          onChange={(e) =>
            setProfile({
              ...profile,
              jobPreferences: { ...profile.jobPreferences!, keywords: e.target.value.split(',').map((k) => k.trim()) },
            })
          }
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
      </section>

      <button onClick={handleSave} style={{ marginTop: '2rem', padding: '10px 20px' }}>
        Guardar Cambios
      </button>
      {statusMessage && <p style={{ marginTop: '10px' }}>{statusMessage}</p>}
    </div>
  );
};

export default ProfileScreen;