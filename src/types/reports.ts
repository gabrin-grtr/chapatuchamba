// old path: src/services/reports.ts
// new path: src/types/reports.ts
// Comentario: Tipos para la generación de reportes.

export interface JobReport {
  totalJobs: number;
  avgSalary: number;
  topSkills: { name: string; count: number }[] | string[];
  jobsBySource: { source: string; count: number }[];
  generatedAt: string;
}
