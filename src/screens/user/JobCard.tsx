import React from 'react';
import { JobListing } from '@/firebase/firebase';
import { MapPin, DollarSign, Clock, Bookmark } from 'lucide-react';
import Button from '@/components/ui/Button';

// Helper function to format salary
const formatSalary = (salary?: { min?: number; max?: number; currency?: string | null }) => {
  if (!salary || (salary.min === undefined && salary.max === undefined)) {
    return 'Salario no especificado';
  }

  // Formatea el número a 'k'
  const formatValue = (value: number) => `${Math.round(value / 1000)}k`;

  const minFormatted = salary.min ? formatValue(salary.min) : null;
  const maxFormatted = salary.max ? formatValue(salary.max) : null;

  let salaryString = '';
  if (minFormatted && maxFormatted && minFormatted !== maxFormatted) {
    salaryString = `${minFormatted} - ${maxFormatted}`;
  } else {
    salaryString = minFormatted || maxFormatted || '';
  }

  if (!salaryString) return 'Salario no especificado';

  // Si hay un código de moneda (USD, PEN, etc.), lo añade. Si no, usa '$' por defecto.
  return salary.currency ? `${salaryString} ${salary.currency}` : `$${salaryString}`;
};

// Helper function to calculate days ago
const calculateDaysAgo = (postedAt: JobListing['postedAt']) => {
  if (!postedAt) return null;
  const days = Math.floor(
    (Date.now() - new Date(postedAt as unknown as string).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return 'Próximamente';
  if (days === 0) return 'Hoy';
  return `Hace ${days} día${days !== 1 ? 's' : ''}`;
};

interface JobCardProps {
  job: JobListing;
  isSaved: boolean;
  onSaveToggle: () => void;
  isSelected?: boolean;
  onSelectToggle?: () => void;
  showSelection?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved,
  onSaveToggle,
  isSelected,
  onSelectToggle,
  showSelection = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 flex flex-col">
      {/* Card Header */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-base line-clamp-2">{job.title}</h3>
            <p className="text-sm text-gray-600 font-medium">{job.company}</p>
          </div>
          <button
            onClick={onSaveToggle}
            aria-label={isSaved ? 'Quitar de guardados' : 'Guardar oferta'}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
              isSaved
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title={isSaved ? 'Quitar de guardados' : 'Guardar oferta'}
          >
            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4 flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-gray-600 text-sm"><MapPin size={16} className="mr-2 text-blue-600" />{job.location}</div>
          {job.salary && (<div className="flex items-center text-gray-600 text-sm font-medium"><DollarSign size={16} className="mr-2 text-green-600" />{formatSalary(job.salary)}</div>)}
          {job.postedAt && (<div className="flex items-center text-gray-500 text-sm"><Clock size={16} className="mr-2" />{calculateDaysAgo(job.postedAt)}</div>)}
        </div>
        {job.description && <p className="text-gray-600 text-sm line-clamp-3">{job.description}</p>}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {job.skills.slice(0, 3).map((skill) => (<span key={skill} className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">{skill}</span>))}
            {job.skills.length > 3 && (<span className="inline-block text-gray-500 text-xs px-2 py-1">+{job.skills.length - 3}</span>)}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
        {showSelection && onSelectToggle && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelectToggle}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
          />
        )}
        <Button onClick={() => window.open(job.jobUrl, '_blank')} className="flex-1 text-center" fullWidth={true}>Ver Oferta →</Button>
      </div>
    </div>
  );
};

export default JobCard;