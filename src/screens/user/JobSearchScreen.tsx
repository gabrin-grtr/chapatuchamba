// old path: src/screens/student/JobSearchScreen.tsx
// new path: src/screens/user/JobSearchScreen.tsx
// Comentario: El archivo ha sido movido a la nueva carpeta 'user'.
// Se ha actualizado para usar 'jobService' en lugar de 'jobStorageService'.

import React, { useState, useEffect } from 'react';
import { Search, Briefcase} from 'lucide-react';
import type { JobListing } from '@/firebase/firebase';
import { jobService } from '@/services/jobService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import JobCard from '@/components/ui/JobCard';
import { useFirebaseAuth } from '@/firebase/firebase'; // Importar el hook de autenticación

const JobSearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  // Usamos un Map para asociar el ID del trabajo (job.id) con el ID del documento guardado (savedJob.id)
  const [savedJobsMap, setSavedJobsMap] = useState<Map<string, string>>(new Map());

  // Usamos el hook para obtener el estado de autenticación del usuario.
  const { currentUserSession } = useFirebaseAuth();

  useEffect(() => {
    if (!currentUserSession?.uid) {
      // Si no hay usuario, es posible que queramos limpiar la lista o no hacer nada.
      setJobs([]);
      setSavedJobsMap(new Map());
      return;
    }

    const loadInitialData = async () => {
      try {
        // Cargar trabajos guardados
        const saved = await jobService.getSavedJobs(currentUserSession.uid);
        const newMap = new Map(saved.map((s) => [s.jobId, s.id]));
        setSavedJobsMap(newMap);

        await handleSearch();
      } catch (error) {
        console.error('Error cargando ofertas guardadas:', error);
      }
    };

    void loadInitialData();
    // La dependencia [user?.uid] asegura que esto se ejecute cuando el usuario inicie sesión
    // y cada vez que este componente se monte con un usuario válido.
  }, [currentUserSession?.uid]);

  const handleSearch = async (event?: React.FormEvent) => {
    if (event) event.preventDefault(); // Prevenir recarga de página si viene de un form
    setLoading(true);
    try {
      // Llamamos a nuestro nuevo backend.
      // Ahora usamos jobService para buscar directamente en Firestore
      const results = await jobService.searchJobs({
        keyword: query,
        location: location,
      });
      setJobs(results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (job: JobListing) => {
    if (!currentUserSession?.uid) {
      alert('Por favor, inicia sesión para guardar ofertas.');
      return;
    }

    const isSaved = savedJobsMap.has(job.id);

    try {
      if (isSaved) {
        const savedJobId = savedJobsMap.get(job.id)!;
        // Actualización optimista
        setSavedJobsMap((prevMap) => {
          const newMap = new Map(prevMap);
          newMap.delete(job.id);
          return newMap;
        });
        await jobService.removeSavedJob(savedJobId, currentUserSession.uid);
      } else {
        const savedJobId = await jobService.saveJob(job, currentUserSession.uid);
        // Actualización optimista
        setSavedJobsMap((prevMap) => {
          const newMap = new Map(prevMap);
          newMap.set(job.id, savedJobId);
          return newMap;
        });
      }
    } catch (error) {
      console.error('Error al actualizar la oferta guardada:', error);
      // En caso de error, recargamos los trabajos guardados para asegurar la consistencia
      if (currentUserSession?.uid) {
        const saved = await jobService.getSavedJobs(currentUserSession.uid);
        setSavedJobsMap(new Map(saved.map((s) => [s.jobId, s.id])));
      }
      alert('Ocurrió un error. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔍 Encuentra tu Próximo Empleo</h1>
          <p className="text-gray-600">
            Busca en cientos de ofertas de empleo reales adaptadas a ti
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puesto/Habilidad
              </label>
              <Input
                type="text"
                placeholder="ej: Frontend Developer, Data Science"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
              <Input
                type="text"
                placeholder="ej: remote, New York, Barcelona"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" isLoading={loading} className="w-full" fullWidth={true}>
                <Search size={18} className="mr-2" />
                Buscar
              </Button>
            </div>
          </div>
        </form>

        {/* Jobs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedJobsMap.has(job.id)}
              onSaveToggle={() => handleSaveJob(job)} // Mantener la funcionalidad de guardar
              showSelection={false} // Deshabilitar la selección en la UI
            />
          ))}
        </div>

        {/* Empty State */}
        {!loading && jobs.length === 0 && (
          <div className="text-center py-16">
            <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              No se encontraron ofertas. Intenta con otros criterios de búsqueda.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-gray-600">Buscando ofertas...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearchScreen;
