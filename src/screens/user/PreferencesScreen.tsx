import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/firebase/firebase';
import { userService } from '@/services/userService';
import { JobSearchPreferences, NotificationPreferences, NotificationFrequency } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Define estados por defecto para las preferencias en caso de que un usuario aún no las tenga.
const defaultJobPrefs: JobSearchPreferences = { keywords: [], locations: [], minSalary: 0, experience: 'Sin experiencia' };
const defaultNotifPrefs: NotificationPreferences = {
  inApp: true,
  email: true,
  frequency: 'daily',
  format: 'summary',
  maxJobs: 5,
};

const PreferencesScreen: React.FC = () => {
  const { currentUserSession } = useFirebaseAuth();
  const [jobPrefs, setJobPrefs] = useState<Partial<JobSearchPreferences>>(defaultJobPrefs);
  const [notifPrefs, setNotifPrefs] = useState<Partial<NotificationPreferences>>(defaultNotifPrefs);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const fetchPreferences = async () => {
      if (currentUserSession?.uid) {
        setLoading(true);
        const profile = await userService.getUserProfile(currentUserSession.uid);
        if (profile) {
          setJobPrefs(profile.jobPreferences || defaultJobPrefs);
          setNotifPrefs(profile.notificationPreferences || defaultNotifPrefs);
        }
        setLoading(false);
      }
    };
    void fetchPreferences();
  }, [currentUserSession]);

  const handleSave = async () => {
    if (!currentUserSession?.uid) return;

    setSaving(true);
    setStatusMessage('Guardando...');

    const completeJobPrefs: JobSearchPreferences = {
      keywords: jobPrefs.keywords ?? [],
      locations: jobPrefs.locations ?? [],
      minSalary: jobPrefs.minSalary ?? 0,
      experience: jobPrefs.experience ?? 'Sin experiencia',
    };
    const completeNotifPrefs: NotificationPreferences = {
      inApp: notifPrefs.inApp ?? true,
      email: notifPrefs.email ?? true,
      frequency: notifPrefs.frequency ?? 'daily',
      format: notifPrefs.format ?? 'summary',
      maxJobs: notifPrefs.maxJobs ?? 5,
    };

    try {
      await userService.saveUserProfile(currentUserSession.uid, {
        jobPreferences: completeJobPrefs,
        notificationPreferences: completeNotifPrefs,
      });
      setStatusMessage('Preferencias guardadas con éxito!');
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      setStatusMessage('Error al guardar las preferencias.');
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleClearJobPrefs = () => {
    setJobPrefs(defaultJobPrefs);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Preferencias</h1>
      <p className="text-gray-600 mb-8">
        Gestiona tus preferencias de empleo y notificaciones para personalizar tu experiencia.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl space-y-8">
        {/* --- Sección de Preferencias de Trabajo --- */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold">Preferencias de Empleo</h3>
            <Button onClick={handleClearJobPrefs} variant="ghost" size="sm">
              Limpiar
            </Button>
          </div>
          <p className="text-gray-600 mb-4">
            Configura tus preferencias de empleo para recibir mejores recomendaciones.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                Palabras clave (separadas por coma)
              </label>
              <Input
                type="text"
                id="keywords"
                placeholder="Ej: react, node, ux"
                value={(jobPrefs.keywords || []).join(', ')}
                onChange={(e) => setJobPrefs({ ...jobPrefs, keywords: e.target.value.split(',').map((k) => k.trim()) })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="locations" className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicaciones (separadas por coma)
                </label>
                <Input
                  type="text"
                  id="locations"
                  placeholder="Remoto, Santiago"
                  value={(jobPrefs.locations || []).join(', ')}
                  onChange={(e) => setJobPrefs({ ...jobPrefs, locations: e.target.value.split(',').map((l) => l.trim()) })}
                />
              </div>
              <div>
                <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700 mb-1">
                  Salario mínimo (USD)
                </label>
                <Input
                  type="number"
                  id="minSalary"
                  value={jobPrefs.minSalary || 0}
                  onChange={(e) => setJobPrefs({ ...jobPrefs, minSalary: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de Experiencia
              </label>
              <select
                id="experience"
                value={jobPrefs.experience || 'Sin experiencia'}
                onChange={(e) => setJobPrefs({ ...jobPrefs, experience: e.target.value as JobSearchPreferences['experience'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Sin experiencia</option>
                <option>Junior</option>
                <option>Senior</option>
                <option>Lead</option>
              </select>
            </div>
          </div>
        </section>

        {/* --- Sección de Preferencias de Notificación --- */}
        <section>
          <h3 className="text-xl font-bold mb-4">Preferencias de Notificación</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="email-notif" className="font-medium text-gray-700">Recibir informes por correo electrónico</label>
              <input
                type="checkbox"
                id="email-notif"
                className="h-6 w-6 rounded text-blue-600 focus:ring-blue-500"
                checked={notifPrefs.email}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, email: e.target.checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="inapp-notif" className="font-medium text-gray-700">Recibir notificaciones en la app</label>
              <input
                type="checkbox"
                id="inapp-notif"
                className="h-6 w-6 rounded text-blue-600 focus:ring-blue-500"
                checked={notifPrefs.inApp}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, inApp: e.target.checked })}
              />
            </div>
            {notifPrefs.email && (
              <div className="pt-4">
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Frecuencia de correos:</label>
                <select
                  id="frequency"
                  value={notifPrefs.frequency}
                  onChange={(e) => setNotifPrefs({ ...notifPrefs, frequency: e.target.value as NotificationFrequency })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="none">Nunca</option>
                </select>
              </div>
            )}
          </div>
        </section>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} isLoading={saving}>
            Guardar Cambios
          </Button>
        </div>
        {statusMessage && <p className="mt-4 text-sm text-center">{statusMessage}</p>}
      </div>
    </div>
  );
};

export default PreferencesScreen;
