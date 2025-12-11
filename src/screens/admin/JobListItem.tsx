import React, { useState } from 'react';
import { ChevronDown, Trash2, ToggleLeft, ToggleRight, Briefcase, Building, MapPin } from 'lucide-react';
import type { JobListing } from '@/firebase/firebase';
import { jobService } from '@/services/jobService';
import Button from '@/components/ui/Button';

interface JobListItemProps {
  job: JobListing;
  onJobUpdate: (job: JobListing) => void;
  onJobDeleted: (jobId: string) => void;
}

const JobListItem: React.FC<JobListItemProps> = ({ job, onJobUpdate, onJobDeleted }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStatus = async () => {
    const newStatus = job.status === 'active' ? 'inactive' : 'active';
    setIsLoading(true);
    try {
      await jobService.updateJobStatus(job.id, newStatus);
      onJobUpdate({ ...job, status: newStatus });
    } catch (error) {
      alert('Failed to update job status.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the job "${job.title}"? This action is permanent.`)) {
      setIsLoading(true);
      try {
        await jobService.deleteJobAdmin(job.id);
        onJobDeleted(job.id);
      } catch (error) {
        alert('Failed to delete job.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const statusColor = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50"
      >
        <div className="flex items-center flex-1 min-w-0">
          <div className="p-2 bg-indigo-100 rounded-full mr-4">
            <Briefcase className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{job.title}</p>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Building size={14} className="mr-1.5" />
              <span>{job.company}</span>
              <span className="mx-2">·</span>
              <MapPin size={14} className="mr-1.5" />
              <span>{job.location}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center ml-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColor[job.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {job.status}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 ml-4 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="font-semibold mb-2 text-gray-700">Detalles de la Oferta</h4>
          <div className="text-sm space-y-3 text-gray-600">
            <p><strong>ID:</strong> {job.id}</p>
            <p><strong>Fuente:</strong> {job.source}</p>
            <p><strong>Descripción:</strong></p>
            <p className="pl-2 border-l-2 border-gray-300 line-clamp-4">{job.description}</p>
            {job.skills && job.skills.length > 0 && (
              <div>
                <strong>Skills:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {job.skills.map(skill => (
                    <span key={skill} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              Ver oferta original →
            </a>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button
              onClick={handleToggleStatus}
              isLoading={isLoading}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              {job.status === 'active' ? <ToggleLeft size={16} className="mr-2" /> : <ToggleRight size={16} className="mr-2" />}
              {job.status === 'active' ? 'Desactivar' : 'Activar'}
            </Button>
            <Button
              onClick={handleDelete}
              isLoading={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 size={16} className="mr-2" />
              Eliminar Oferta
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListItem;