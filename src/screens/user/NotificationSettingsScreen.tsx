import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/firebase/firebase';
import { userService } from '@/services/userService';
import { NotificationPreferences, NotificationFrequency, JobSearchPreferences } from '@/types';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Input from '@/components/ui/Input';

const NotificationSettingsScreen: React.FC = () => {
  const { currentUserSession } = useFirebaseAuth();
  const [notifPrefs, setNotifPrefs] = useState<Partial<NotificationPreferences>>({});
  const [jobPrefs, setJobPrefs] = useState<Partial<JobSearchPreferences>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!currentUserSession?.uid) return;
      setLoading(true);
      const profile = await userService.getUserProfile(currentUserSession.uid);
      // Establecer valores predeterminados para las preferencias de notificación
      const defaultNotifPrefs: NotificationPreferences = {
        inApp: true,
        email: true,
        frequency: 'daily',
        format: 'summary',
        maxJobs: 5,
      };
      // Establecer valores predeterminados para las preferencias de trabajo
      const defaultJobPrefs: JobSearchPreferences = {
        keywords: [],
        locations: [],
        minSalary: 0,
      };
      setNotifPrefs(profile?.notificationPreferences || defaultNotifPrefs);
      setJobPrefs(profile?.jobPreferences || defaultJobPrefs);
      setLoading(false);
    };
    fetchPreferences();
  }, [currentUserSession]);

  const handleSave = async () => {
    if (!currentUserSession?.uid) return;
    setSaving(true);
    // Se crean objetos completos para asegurar que todos los campos requeridos se envían.
    const completeNotifPrefs: NotificationPreferences = {
      inApp: notifPrefs.inApp ?? true,
      email: notifPrefs.email ?? true,
      frequency: notifPrefs.frequency ?? 'daily',
      format: notifPrefs.format ?? 'summary',
      maxJobs: notifPrefs.maxJobs ?? 5,
    };
    const completeJobPrefs: JobSearchPreferences = {
      keywords: jobPrefs.keywords ?? [],
      locations: jobPrefs.locations ?? [],
      minSalary: jobPrefs.minSalary ?? 0,
    };
    await userService.saveUserProfile(currentUserSession.uid, {
      notificationPreferences: completeNotifPrefs,
      jobPreferences: completeJobPrefs,
    });
    setSaving(false);
    // Aquí podrías añadir un toast o mensaje de "Guardado con éxito"
  };

  const handleNotifInputChange = (
    field: keyof NotificationPreferences,
    value: NotificationPreferences[keyof NotificationPreferences]
  ) => {
    setNotifPrefs((prev) => ({ ...prev, [field]: value }));
  };

  const handleJobPrefInputChange = (
    field: keyof JobSearchPreferences,
    value: JobSearchPreferences[keyof JobSearchPreferences]
  ) => {
    setJobPrefs((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ajustes de Notificaciones</h1>
      <p className="text-gray-600 mb-8">
        Gestiona cómo y cuándo te informamos sobre nuevas oportunidades de empleo.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl space-y-6">
        {/* --- Preferencias de Trabajo --- */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Preferencias de Trabajo</h2>
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
              Tipos de trabajo o palabras clave (separadas por coma)
            </label>
            <Input
              id="keywords"
              type="text"
              placeholder="Ej: react, node, ux"
              value={(jobPrefs.keywords || []).join(', ')}
              onChange={(e) => handleJobPrefInputChange('keywords', e.target.value.split(',').map((k) => k.trim()))}
              className="w-full mt-2 p-3 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Esto es necesario para que sepamos qué trabajos recomendarte.
            </p>
          </div>
        </div>

        {/* --- Preferencias de Notificación --- */}
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Canales de Notificación</h2>
          {/* Notificaciones por Email */}
          <div className="flex items-center justify-between">
            <label htmlFor="email-notifications" className="font-medium text-gray-700">Recibir resúmenes por correo</label>
            <input
              id="email-notifications"
              type="checkbox"
              className="h-6 w-6 rounded text-blue-600 focus:ring-blue-500"
              checked={notifPrefs.email || false}
              onChange={(e) => handleNotifInputChange('email', e.target.checked)}
            />
          </div>

          {/* Notificaciones en la App */}
          <div className="flex items-center justify-between">
            <label htmlFor="inapp-notifications" className="font-medium text-gray-700">Recibir notificaciones en la app</label>
            <input
              id="inapp-notifications"
              type="checkbox"
              className="h-6 w-6 rounded text-blue-600 focus:ring-blue-500"
              checked={notifPrefs.inApp || false}
              onChange={(e) => handleNotifInputChange('inApp', e.target.checked)}
            />
          </div>

          {/* Frecuencia de Envío (si el email está activado) */}
          {notifPrefs.email && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frecuencia de correos</label>
                <select
                  id="frequency"
                  value={notifPrefs.frequency}
                  onChange={(e) => handleNotifInputChange('frequency', e.target.value as NotificationFrequency)}
                  className="w-full mt-2 p-3 border rounded-lg"
                >
                  <option value="daily">Diariamente</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="none">Nunca</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} isLoading={saving}>
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsScreen;