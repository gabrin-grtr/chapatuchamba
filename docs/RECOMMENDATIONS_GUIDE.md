# 🧠 Sistema Inteligente de Recomendaciones

El aplicativo ahora incluye un **motor de recomendaciones basado en IA** que utiliza un algoritmo de matching sofisticado para sugerir ofertas de empleo personalizadas.

## 📊 Algoritmo de Matching

El sistema calcula un score (0-100%) para cada oferta basándose en:

- **Keywords/Habilidades (40%)**: Coincidencia con tus palabras clave y habilidades deseadas
- **Ubicación (20%)**: Coincidencia geográfica o preferencia de trabajo remoto
- **Rango Salarial (25%)**: Coincidencia con tus expectativas de compensación
- **Tipo de Contrato (15%)**: Coincidencia con tipo de empleo preferido (remoto, presencial, híbrido, etc.)

## 🎯 Cómo Usar las Recomendaciones

### 1. Completar Preferencias

Primero, dirígete a **Preferencias** y completa:

- Palabras clave de búsqueda (ej: "React", "Node.js", "Python")
- Ubicaciones preferidas (ej: "Madrid", "Remoto", "Barcelona")
- Rango salarial (mín - máx)
- Tipo de contrato preferido

### 2. Ver Recomendaciones Personalizadas

En la pantalla **Buscar Empleos**:

- El tab "Recomendaciones" muestra ofertas ordenadas por relevancia
- Cada tarjeta muestra el % de coincidencia
- Las ofertas con score >80% son especialmente recomendadas

### 3. Acciones Disponibles

Para cada recomendación puedes:

- ❤️ **Guardar**: Agregue a tu lista de empleos guardados
- **Ver Oferta**: Abre la oferta en el sitio original
- **Correo**: Envía recomendaciones por email

## 🔧 Integración en Componentes

### Usar el Hook `useJobRecommendations`

```typescript
import { useJobRecommendations } from '@/hooks/useJobRecommendations';

function MyComponent() {
  const { recommendedJobs, scores, matchPercentage, loading, error } = useJobRecommendations(
    userId,
    allJobs,
    0.5
  );

  return (
    <>
      {recommendedJobs.map((job) => (
        <div key={job.id}>
          <h3>{job.title}</h3>
          <p>Match: {matchPercentage(job.id)}</p>
        </div>
      ))}
    </>
  );
}
```

### Usar el Panel de Recomendaciones

```typescript
import { RecommendationsPanel } from '@/components/RecommendationsPanel';

<RecommendationsPanel
  userId={currentUser.uid}
  jobs={allAvailableJobs}
  onSaveJob={(jobId) => handleSave(jobId)}
  onNavigateToJob={(jobId) => handleNavigate(jobId)}
  savedJobIds={savedJobIds}
  matchThreshold={0.5}
/>;
```

## 📈 Próximas Mejoras

- [ ] Automatización con Cloud Functions para recomendaciones diarias
- [ ] Machine Learning para mejorar el algoritmo de scoring
- [ ] Historial de vistas para aprendizaje adaptativo
- [ ] Notificaciones push para nuevas recomendaciones
- [ ] Exportar recomendaciones a PDF

## 🐛 Troubleshooting

**P: No veo ninguna recomendación**

- R: Asegúrate de completar tus preferencias en la pantalla Preferencias

**P: Los scores son muy bajos**

- R: El algoritmo es conservador. Intenta bajar el matchThreshold a 0.3 o 0.4

**P: Quiero cambiar el algoritmo de scoring**

- R: Edita `src/services/jobStorageService.ts`, método `calculateJobMatchScore()`
