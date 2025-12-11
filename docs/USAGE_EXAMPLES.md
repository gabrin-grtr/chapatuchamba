# 📚 Ejemplos de Uso - Integración Frontend-Backend

## 1. Sincronizar Empleos Desde el Frontend

### Llamar la API de sincronización

```typescript
// src/services/syncService.ts
import axios from 'axios';

export class SyncService {
  private baseUrl = 'https://us-central1-chapatuchamba-cdd3a.cloudfunctions.net';

  async syncJobsFromTalentSolution(
    query: string = 'technology',
    location: string = 'USA',
    pageSize: number = 50
  ) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/syncJobsFromTalentSolution`,
        {
          query,
          location,
          pageSize,
        }
      );

      console.log('Sync completado:', response.data.stats);
      return response.data;
    } catch (error) {
      console.error('Error sincronizando:', error);
      throw error;
    }
  }

  async getSync Status() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/getSyncStatus`
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo status:', error);
      throw error;
    }
  }
}

// Uso en componente:
const syncService = new SyncService();
await syncService.syncJobsFromTalentSolution('software engineer', 'San Francisco');
```

---

## 2. Guardar Preferencias de Usuario

### En Firestore desde Cloud Functions

```typescript
// Cuando el usuario configura sus preferencias:
import { saveUserPreferences } from '../services/firestoreService';

const userPrefs = {
  userId: 'user-123',
  keywords: ['JavaScript', 'React', 'Node.js'],
  locations: ['San Francisco', 'New York', 'Remote'],
  jobTypes: ['full-time', 'contract'],
  minSalary: 80000,
  maxSalary: 150000,
  skills: ['TypeScript', 'AWS', 'Docker'],
  experience: 'Senior',
  emailFrequency: 'daily',
  notificationEnabled: true,
  notificationEmail: 'user@example.com',
  notificationFormat: 'detailed',
  maxNotifications: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

await saveUserPreferences(userPrefs);
```

---

## 3. Obtener Empleos Personalizados

### Desde Cloud Functions (automáticamente cada 6 horas)

```typescript
// El sistema hace esto automáticamente:

// 1. Obtiene empleos válidos
const validJobs = await getValidCleanJobs(200);

// 2. Obtiene preferencias del usuario
const userPrefs = await getUserPreferences(userId);

// 3. Calcula matching
const matchedJobs = validJobs
  .map((job) => {
    const { score, reasons } = JobMatchingService.calculateMatchScore(job, userPrefs);
    return JobMatchingService.createMatchedJob(job, userId, score, reasons);
  })
  .filter((job) => job.matchScore >= 30);

// 4. Ordena por score
const topJobs = JobMatchingService.sortByScore(matchedJobs).slice(0, 10);

// 5. Guarda para el usuario
await saveMatchedJobs(userId, topJobs);
```

---

## 4. Recibir Emails Automáticos

### El usuario recibe emails en estos casos:

#### a) Notificación Diaria (si emailFrequency = 'daily')

- Se envía automáticamente cada 6 horas
- Contiene las top ofertas personalizadas
- Formato: summary o detailed

#### b) Reporte Semanal (si emailFrequency = 'weekly')

- Se envía cada lunes a las 9 AM
- Incluye estadísticas de la semana
- Top skills demandados
- Top 10 ofertas

#### c) Reporte Mensual (si emailFrequency = 'monthly')

- Se envía el 1° de cada mes a las 9 AM
- Análisis completo del mes
- Tendencias salariales

### Ejemplo de email recibido:

```
Subject: 🎯 5 nuevas ofertas de trabajo para ti - 5 Dec 2025

Dear Usuario,

Hemos encontrado 5 nuevas oportunidades que se ajustan a tu perfil:

1. Senior React Developer - TechCorp
   📍 San Francisco, CA
   💰 $120,000 - $160,000 USD
   Tipo: full-time
   Descripción: Building scalable React applications...

2. Full Stack Engineer - StartupXYZ
   ...

Ver todas las ofertas →
https://chapatuchamba.com/jobs
```

---

## 5. Mostrar Ofertas en la UI

### Componente para mostrar empleos matched

```typescript
// src/components/PersonalizedJobs.tsx
import { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { MatchedJob } from '../services/types';
import JobCard from './JobCard';

export function PersonalizedJobs({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Obtiene los empleos matched del usuario desde Firestore
        const snapshot = await db
          .collection('jobs_matched')
          .where('userId', '==', userId)
          .orderBy('matchScore', 'desc')
          .limit(20)
          .get();

        const matchedJobs: MatchedJob[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MatchedJob[];

        setJobs(matchedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [userId]);

  if (loading) return <div>Cargando ofertas personalizadas...</div>;
  if (jobs.length === 0) return <div>No hay ofertas para ti ahora</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} matchScore={job.matchScore} />
      ))}
    </div>
  );
}
```

### JobCard Component

```typescript
// src/components/JobCard.tsx
interface JobCardProps {
  job: MatchedJob;
  matchScore: number;
}

export function JobCard({ job, matchScore }: JobCardProps) {
  const scoreColor =
    matchScore >= 80 ? 'bg-green-500' : matchScore >= 60 ? 'bg-blue-500' : 'bg-yellow-500';

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{job.title}</h3>
        <div className={`${scoreColor} text-white px-3 py-1 rounded text-sm font-bold`}>
          {matchScore}%
        </div>
      </div>

      <p className="text-gray-600 font-semibold">{job.company}</p>
      <p className="text-gray-500 text-sm">📍 {job.location}</p>

      {job.salaryMin && (
        <p className="text-green-600 font-bold mt-2">
          💰 ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
        </p>
      )}

      {job.employmentType && (
        <p className="text-gray-700 text-sm mt-2">Tipo: {job.employmentType}</p>
      )}

      {job.matchReasons && job.matchReasons.length > 0 && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
          <strong>Razones del match:</strong>
          <ul className="list-disc list-inside mt-1">
            {job.matchReasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={job.jobUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700"
      >
        Ver Oferta
      </a>
    </div>
  );
}
```

---

## 6. Panel de Preferencias de Usuario

### Componente para configurar preferencias

```typescript
// src/components/PreferencesPanel.tsx
import { useState, useEffect } from 'react';
import { getUserPreferences, saveUserPreferences } from '../services/firestoreService';

export function PreferencesPanel({ userId }: { userId: string }) {
  const [prefs, setPrefs] = useState({
    keywords: ['JavaScript', 'React'],
    locations: ['Remote'],
    jobTypes: ['full-time'],
    minSalary: 50000,
    maxSalary: 120000,
    emailFrequency: 'daily' as const,
    notificationEmail: 'user@example.com',
    notificationFormat: 'summary' as const,
    maxNotifications: 5,
  });

  const handleSave = async () => {
    try {
      await saveUserPreferences({
        userId,
        ...prefs,
        createdAt: new Date(),
        updatedAt: new Date(),
        skills: ['TypeScript', 'AWS'],
        notificationEnabled: true,
      });
      alert('Preferencias guardadas ✅');
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      alert('Error al guardar preferencias ❌');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Mis Preferencias</h2>

      <div>
        <label className="block font-semibold mb-2">Frecuencia de Notificaciones</label>
        <select
          value={prefs.emailFrequency}
          onChange={(e) => setPrefs({ ...prefs, emailFrequency: e.target.value as any })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="daily">Diarias</option>
          <option value="weekly">Semanales</option>
          <option value="monthly">Mensuales</option>
          <option value="never">Nunca</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-2">Salario Mínimo</label>
        <input
          type="number"
          value={prefs.minSalary}
          onChange={(e) => setPrefs({ ...prefs, minSalary: parseInt(e.target.value) })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold"
      >
        Guardar Cambios
      </button>
    </div>
  );
}
```

---

## 7. Ejemplo Completo de Integración

```typescript
// src/hooks/useJobMatching.ts
import { useEffect, useState } from 'react';
import { getMatchedJobsForUser, getUserPreferences } from '../services/firestoreService';
import { MatchedJob, UserPreferencesDoc } from '../services/types';

export function useJobMatching(userId: string) {
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [prefs, setPrefs] = useState<UserPreferencesDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carga preferencias y empleos en paralelo
        const [prefsData, jobsData] = await Promise.all([
          getUserPreferences(userId),
          getMatchedJobsForUser(userId, 50),
        ]);

        setPrefs(prefsData);
        setJobs(jobsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  return { jobs, prefs, loading, error };
}

// Uso en componente:
function Dashboard() {
  const { jobs, prefs, loading } = useJobMatching('user-123');

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Ofertas Personalizadas para ti</h1>
      <p>Frecuencia de emails: {prefs?.emailFrequency}</p>
      <p>Encontrados: {jobs.length} empleos</p>
      {/* Renderizar JobCards aquí */}
    </div>
  );
}
```

---

## 📊 Ejemplo de Datos en Firestore

### Documento en `jobs_matched`

```json
{
  "id": "matched-001",
  "userId": "user-123",
  "title": "Senior React Developer",
  "company": "TechCorp",
  "location": "San Francisco, CA",
  "salaryMin": 120000,
  "salaryMax": 160000,
  "salaryCurrency": "USD",
  "jobUrl": "https://techcorp.com/jobs/123",
  "matchScore": 92,
  "matchReasons": [
    "Ubicación coincide con preferencias",
    "Tipo de empleo full-time coincide",
    "JavaScript y React son habilidades clave",
    "Salario dentro del rango preferido",
    "Oferta publicada recientemente"
  ],
  "isValid": true,
  "isExpired": false,
  "isWebsiteAvailable": true,
  "createdAt": "2025-12-05T10:30:00Z",
  "postedDate": "2025-12-01T08:00:00Z"
}
```

### Documento en `user_preferences`

```json
{
  "userId": "user-123",
  "keywords": ["JavaScript", "React", "Node.js"],
  "locations": ["San Francisco", "Remote"],
  "jobTypes": ["full-time", "contract"],
  "minSalary": 80000,
  "maxSalary": 150000,
  "skills": ["TypeScript", "AWS", "Docker"],
  "experience": "Senior",
  "emailFrequency": "daily",
  "notificationEmail": "user@example.com",
  "notificationFormat": "detailed",
  "maxNotifications": 10,
  "notificationEnabled": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-12-05T10:00:00Z"
}
```

---

## ✨ Resumen

El sistema funciona así:

1. ✅ **Usuario configura preferencias** → Se guardan en Firestore
2. ✅ **Sistema sincroniza empleos** → Cada 6 horas desde Google Talent Solution
3. ✅ **Se validan empleos** → Se filtran por expiración, sitio web, etc.
4. ✅ **Se personaliza** → Se calcula score de matching para cada usuario
5. ✅ **Se envía email** → Automáticamente según frecuencia preferida
6. ✅ **Usuario ve ofertas** → En la UI con score y razones de match

¡Todo automático y personalizado! 🚀
