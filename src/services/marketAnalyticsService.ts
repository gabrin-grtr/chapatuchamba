import { JobOffer } from '@/types';

export interface MarketAnalytics {
  topSkills: { skill: string; count: number }[];
  averageSalary: number;
  salaryRange: { min: number; max: number };
  topCompanies: { company: string; count: number }[];
  employmentTypeDistribution: Record<string, number>;
  totalJobs: number;
  jobsByLocation: { location: string; count: number }[];
  averagePostingAgeInDays: number;
}

/**
 * Servicio para analizar estadísticas y tendencias del mercado laboral
 */
class MarketAnalyticsService {
  /**
   * Calcula análisis del mercado basado en ofertas disponibles
   */
  analyzeMarket(jobs: JobOffer[]): MarketAnalytics {
    if (jobs.length === 0) {
      return this.getEmptyAnalytics();
    }

    return {
      topSkills: this.extractTopSkills(jobs),
      averageSalary: this.calculateAverageSalary(jobs),
      salaryRange: this.calculateSalaryRange(jobs),
      topCompanies: this.getTopCompanies(jobs),
      employmentTypeDistribution: this.getEmploymentTypeDistribution(jobs),
      totalJobs: jobs.length,
      jobsByLocation: this.getJobsByLocation(jobs),
      averagePostingAgeInDays: this.calculateAveragePostingAge(jobs),
    };
  }

  /**
   * Extrae y cuenta las habilidades más demandadas
   */
  private extractTopSkills(jobs: JobOffer[]): { skill: string; count: number }[] {
    const skillsMap = new Map<string, number>();

    jobs.forEach((job) => {
      const skills = job.skills || [];
      const descriptionSkills = this.extractSkillsFromDescription(job.description || '');

      const allSkills = [...skills, ...descriptionSkills];
      allSkills.forEach((skill) => {
        const normalized = skill.toLowerCase().trim();
        skillsMap.set(normalized, (skillsMap.get(normalized) || 0) + 1);
      });
    });

    return Array.from(skillsMap.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  }

  /**
   * Extrae habilidades mencionadas en la descripción del trabajo
   */
  private extractSkillsFromDescription(description: string): string[] {
    const commonSkills = [
      'javascript',
      'typescript',
      'python',
      'java',
      'c++',
      'react',
      'angular',
      'vue',
      'node.js',
      'express',
      'mongodb',
      'postgresql',
      'sql',
      'docker',
      'kubernetes',
      'aws',
      'azure',
      'gcp',
      'git',
      'rest api',
      'graphql',
      'html',
      'css',
      'bootstrap',
      'tailwind',
      'webpack',
      'vite',
      'testing',
      'jest',
      'cypress',
      'agile',
      'scrum',
      'jira',
      'linux',
      'windows',
      'macos',
    ];

    const lowerDesc = description.toLowerCase();
    return commonSkills.filter((skill) => lowerDesc.includes(skill.toLowerCase()));
  }

  /**
   * Calcula el salario promedio de las ofertas
   */
  private calculateAverageSalary(jobs: JobOffer[]): number {
    const salaries: number[] = jobs
      .map((job) => this.extractSalaryNumber(job.salary))
      .filter((s) => s > 0);

    if (salaries.length === 0) return 0;
    return Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length);
  }

  /**
   * Extrae número de salario de diferentes formatos
   */
  private extractSalaryNumber(salary: JobOffer['salary']): number {
    if (!salary) return 0;

    if (typeof salary === 'object' && salary !== null) {
      return (salary.min + (salary.max || salary.min)) / 2;
    }

    if (typeof salary === 'string') {
      const numbers = (salary as string).match(/\d+(?:,\d+)?(?:\.\d+)?/g);
      if (numbers) {
        return parseInt(numbers[0].replace(/,/g, ''));
      }
    }

    return 0;
  }

  /**
   * Calcula rango de salarios (mín - máx)
   */
  private calculateSalaryRange(jobs: JobOffer[]): { min: number; max: number } {
    const salaries = jobs.map((job) => this.extractSalaryNumber(job.salary)).filter((s) => s > 0);

    if (salaries.length === 0) return { min: 0, max: 0 };

    return {
      min: Math.min(...salaries),
      max: Math.max(...salaries),
    };
  }

  /**
   * Obtiene las empresas con más ofertas
   */
  private getTopCompanies(jobs: JobOffer[]): { company: string; count: number }[] {
    const companiesMap = new Map<string, number>();

    jobs.forEach((job) => {
      const company = job.company || job.companyName || 'Unknown';
      companiesMap.set(company, (companiesMap.get(company) || 0) + 1);
    });

    return Array.from(companiesMap.entries())
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  }

  /**
   * Distribuye empleos por tipo de contrato
   */
  private getEmploymentTypeDistribution(jobs: JobOffer[]): Record<string, number> {
    const distribution: Record<string, number> = {
      'Tiempo Completo': 0,
      'Medio Tiempo': 0,
      Contrato: 0,
      Freelance: 0,
      Indefinido: 0,
    };

    jobs.forEach((job) => {
      const type = job.contractType || 'Indefinido';
      const normalized = this.normalizeEmploymentType(type);
      distribution[normalized] = (distribution[normalized] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Normaliza tipos de contrato a categorías estándar
   */
  private normalizeEmploymentType(type: string): string {
    const normalized = type.toLowerCase();

    if (
      normalized.includes('tiempo completo') ||
      normalized.includes('full time') ||
      normalized.includes('fulltime')
    ) {
      return 'Tiempo Completo';
    }
    if (
      normalized.includes('medio tiempo') ||
      normalized.includes('part time') ||
      normalized.includes('parttime')
    ) {
      return 'Medio Tiempo';
    }
    if (normalized.includes('contrato') || normalized.includes('contract')) {
      return 'Contrato';
    }
    if (normalized.includes('freelance')) {
      return 'Freelance';
    }

    return 'Indefinido';
  }

  /**
   * Agrupa empleos por ubicación
   */
  private getJobsByLocation(jobs: JobOffer[]): { location: string; count: number }[] {
    const locationsMap = new Map<string, number>();

    jobs.forEach((job) => {
      const location = job.location || 'Sin ubicación';
      locationsMap.set(location, (locationsMap.get(location) || 0) + 1);
    });

    return Array.from(locationsMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8
  }

  /**
   * Calcula la antigüedad promedio de las ofertas en días
   */
  private calculateAveragePostingAge(jobs: JobOffer[]): number {
    const now = new Date();
    const ages = jobs
      .filter((job) => job.postedAt)
      .map((job) => {
        const posted = new Date(job.postedAt);
        return Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
      });

    if (ages.length === 0) return 0;
    return Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);
  }

  /**
   * Retorna objeto vacío de analytics
   */
  private getEmptyAnalytics(): MarketAnalytics {
    return {
      topSkills: [],
      averageSalary: 0,
      salaryRange: { min: 0, max: 0 },
      topCompanies: [],
      employmentTypeDistribution: {},
      totalJobs: 0,
      jobsByLocation: [],
      averagePostingAgeInDays: 0,
    };
  }

  /**
   * Genera resumen de tendencias del mercado
   */
  generateMarketSummary(analytics: MarketAnalytics): string {
    const lines: string[] = [];

    if (analytics.totalJobs > 0) {
      lines.push(`📊 ${analytics.totalJobs} ofertas analizadas`);

      if (analytics.topSkills.length > 0) {
        const topSkill = analytics.topSkills[0];
        lines.push(`📈 Skill más demandado: ${topSkill.skill} (${topSkill.count} ofertas)`);
      }

      if (analytics.topCompanies.length > 0) {
        const topCompany = analytics.topCompanies[0];
        lines.push(`🏢 Empresa más activa: ${topCompany.company} (${topCompany.count} ofertas)`);
      }

      if (analytics.averageSalary > 0) {
        lines.push(`💰 Salario promedio: $${analytics.averageSalary.toLocaleString()}`);
      }

      if (analytics.jobsByLocation.length > 0) {
        const topLocation = analytics.jobsByLocation[0];
        lines.push(`📍 Ubicación más popular: ${topLocation.location}`);
      }
    } else {
      lines.push('Sin datos disponibles');
    }

    return lines.join('\n');
  }
}

export default new MarketAnalyticsService();
