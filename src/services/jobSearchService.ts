import { jobService } from './jobService';
import { JobListing } from '../firebase/firebase';

/**
 * @deprecated Este servicio ha sido reemplazado por `jobService`.
 * Esta función ahora actúa como un wrapper para mantener la compatibilidad hacia atrás, pero debería ser eliminada.
 * Se recomienda encarecidamente migrar los componentes para que usen `jobService.searchJobs` directamente.
 *
 * Busca trabajos delegando la llamada al servicio de almacenamiento de Firestore.
 * @param query El término de búsqueda del usuario.
 * @returns Una promesa que se resuelve con la lista de trabajos encontrados.
 */
export const searchJobs = async (query: string): Promise<JobListing[]> => {
  console.warn('[DEPRECATED] La función `searchJobs` de `jobSearchService` está obsoleta. Utilice `jobService` en su lugar.');

  if (!query) {
    console.warn('El término de búsqueda está vacío.');
    return [];
  }

  // Delega la llamada al nuevo servicio, mapeando el query simple a un filtro de keyword.
  try {
    const results = await jobService.searchJobs({ keyword: query });
    console.log(`Búsqueda delegada a jobService. Se encontraron ${results.length} trabajos.`);
    return results;
  } catch (error) {
    console.error('Ocurrió un error al delegar la búsqueda de trabajos a jobService:', error);
    return [];
  }
};
