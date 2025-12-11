import { Heart, Zap } from 'lucide-react';
import React, { useState, FC } from 'react';

interface RecommendedJobsCardProps {
  title: string;
  company: string;
  location: string;
  salary?: string;
  matchScore: number; // 0-1
  onSave?: () => void;
  onApplyClick?: () => void;
  jobUrl?: string;
  isSaved?: boolean;
}

/**
 * Componente para mostrar tarjeta de empleo recomendado con score de matching
 */
export const RecommendedJobsCard: FC<RecommendedJobsCardProps> = ({
  title,
  company,
  location,
  salary,
  matchScore,
  onSave,
  onApplyClick,
  jobUrl,
  isSaved = false,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const matchPercentage = Math.round(matchScore * 100);

  // Color dinámico basado en score
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'from-green-500 to-green-400';
    if (score >= 0.6) return 'from-blue-500 to-blue-400';
    if (score >= 0.4) return 'from-yellow-500 to-yellow-400';
    return 'from-orange-500 to-orange-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-700';
    if (score >= 0.6) return 'bg-blue-100 text-blue-700';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-700';
    return 'bg-orange-100 text-orange-700';
  };

  return (
    <div
      className="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Match Score Badge */}
      <div
        className={`absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getScoreBg(
          matchScore
        )}`}
      >
        <Zap size={14} />
        {matchPercentage}% match
      </div>

      {/* Match Score Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div
          className={`h-full bg-gradient-to-r ${getScoreColor(
            matchScore
          )} transition-all duration-300`}
          style={{ width: `${matchPercentage}%` }}
        />
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1">{title}</h3>

        <p className="text-sm text-gray-600 font-medium mb-3">{company}</p>

        <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-500">
          <span>📍 {location}</span>
          {salary && <span>💰 {salary}</span>}
        </div>

        {/* Match Explanation */}
        {matchPercentage >= 60 && (
          <div className="mb-3 p-2 bg-blue-50 rounded text-xs text-blue-700 border border-blue-200">
            <p className="font-semibold mb-1">✓ Buena recomendación para ti</p>
            <p className="opacity-75">
              {matchPercentage >= 80
                ? 'Coincide muy bien con tus preferencias y habilidades'
                : 'Coincide con varias de tus preferencias'}
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-2">
          <button
            onClick={onApplyClick}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 ${
              isHovering ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {jobUrl ? '→ Ver Oferta' : 'Detalles'}
          </button>

          <button
            onClick={onSave}
            className={`py-2 px-3 rounded-lg transition-all duration-200 ${
              isSaved ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isSaved ? 'Guardado' : 'Guardar oferta'}
          >
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
};
