// old path: src/screens/student/GuardadoScreen.tsx
// new path: src/screens/user/SavedJobsScreen.tsx
// Comentario: El archivo ha sido movido a la carpeta 'user' y renombrado para mayor claridad y consistencia.
// Ahora utiliza 'jobService' en lugar del antiguo 'jobStorageService'.

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { jobService } from '@/services/jobService';
import { SavedJob } from '@/types';
import { Briefcase } from 'lucide-react';
import JobCard from '@/components/ui/JobCard';

const SavedJobsScreen: React.FC = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // La lógica de carga ahora es eficiente: jobStorageService.getSavedJobs ya nos devuelve los trabajos completos.
      const jobs = await jobService.getSavedJobs(user.uid);
      setSavedJobs(jobs);
    } catch (error) {
      console.error('Error al cargar los trabajos guardados:', error);
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSavedJobs();
  }, [user?.uid]);

  const handleUnsaveJob = async (savedJobId: string) => {
    if (!user?.uid) return;
    try {
      // Actualización optimista para una UI más rápida: se elimina el trabajo de la vista inmediatamente.
      setSavedJobs((currentJobs) => currentJobs.filter((job) => job.id !== savedJobId));
      await jobService.removeSavedJob(savedJobId, user.uid);
    } catch (error) {
      console.error('Error al quitar trabajo guardado:', error);
      // Si la operación falla, se revierte el cambio recargando los datos.
      void fetchSavedJobs();
      alert('Error al quitar el trabajo guardado.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center gap-2">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-gray-600">Cargando trabajos guardados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Mis Trabajos Guardados</h1>
        <p className="text-sm text-gray-600">{savedJobs.length} guardados</p>
      </div>
      {savedJobs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold">No tienes ofertas guardadas</h3>
          <p className="mt-1">Usa el ícono de marcador para guardar las que te interesen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map(({ id: savedJobId, job }) => (
            <JobCard
              key={savedJobId}
              job={job}
              isSaved={true}
              onSaveToggle={() => handleUnsaveJob(savedJobId)}
              showSelection={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobsScreen;
