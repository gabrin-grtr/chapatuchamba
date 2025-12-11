# Estructura del Proyecto - ChapaTuChamba

## 📁 Estructura Reorganizada

```
proyecto/
├── src/
│   ├── config/                    # ✅ NUEVA - Configuración centralizada
│   │   ├── index.ts              # Exportador principal
│   │   ├── constants.ts          # Constantes de la app
│   │   └── env.ts                # Variables de ambiente
│   │
│   ├── components/               # Componentes React reutilizables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── JobCard.tsx
│   │   ├── Modal.tsx
│   │   ├── RecommendationsPanel.tsx
│   │   ├── RecommendedJobsCard.tsx
│   │   ├── StatsCard.tsx
│   │   └── Toggle.tsx
│   │
│   ├── screens/                  # Pantallas principales (por feature)
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   ├── student/
│   │   │   ├── StudentHome.tsx
│   │   │   ├── JobSearchScreen.tsx
│   │   │   ├── GuardadoScreen.tsx
│   │   │   ├── NotificationsScreen.tsx
│   │   │   ├── PreferencesScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── ReportsScreen.tsx
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx
│   │   └── recruiter/
│   │       └── RecruiterDashboard.tsx
│   │
│   ├── services/                 # Servicios de negocio
│   │   ├── jobSearchService.ts
│   │   ├── jobStorageService.ts
│   │   ├── emailNotificationService.ts
│   │   └── marketAnalyticsService.ts
│   │
│   ├── firebase/                 # Configuración e integración Firebase
│   │   └── firebase.ts
│   │
│   ├── context/                  # Context API para estado global
│   │   └── JobContext.tsx
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── useJobRecommendations.ts
│   │
│   ├── data/                     # Datos mock/seed
│   │   └── seedData.ts
│   │
│   ├── constants/                # ⚠️ DEPRECADO (usar src/config)
│   │   └── index.ts
│   │
│   ├── utils/                    # ✅ NUEVA - Funciones utilitarias
│   │   └── (agregar funciones helpers)
│   │
│   ├── types.ts                  # Tipos TypeScript globales
│   ├── App.tsx                   # Componente raíz
│   ├── main.tsx                  # Punto de entrada React
│   └── index.css                 # Estilos globales
│
├── functions/                    # Cloud Functions
│   ├── src/
│   ├── lib/
│   ├── tsconfig.json
│   └── package.json
│
├── .env.local                    # Variables de ambiente (local)
├── .env.local.example            # Template de variables
├── .firebaserc                   # Configuración Firebase CLI
├── firebase.json                 # Configuración Firebase Hosting
├── firestore.rules               # Reglas Firestore
├── tsconfig.json                 # Config TypeScript (actualizado)
├── vite.config.ts                # Config Vite (actualizado)
├── tailwind.config.js            # Config Tailwind CSS
├── postcss.config.cjs            # Config PostCSS
├── package.json                  # Dependencias
└── index.html                    # HTML principal
```

## ✅ Cambios Realizados

### 1. **Archivos Eliminados**

- `config.ts` (raíz) - VACÍO ❌
- `email.ts` (raíz) - VACÍO ❌
- `jobs.ts` (raíz) - VACÍO ❌
- `index.ts` (raíz) - VACÍO ❌
- `firebase.ts` (raíz) - DUPLICADO ❌
- `constants.ts` (raíz) - DUPLICADO ❌

### 2. **Nuevas Carpetas Creadas**

- `src/config/` - Configuración centralizada
- `src/utils/` - Funciones utilitarias

### 3. **Nuevos Archivos en src/config/**

- `constants.ts` - Constantes consolidadas
- `env.ts` - Variables de ambiente
- `index.ts` - Exportador principal

### 4. **Alias de Importación Mejorados**

```typescript
// ANTES (inconsistente)
import { UserSession } from '../../types';
import JobCard from '../../components/JobCard';

// DESPUÉS (alias @/)
import { UserSession } from '@/types';
import JobCard from '@/components/JobCard';
```

### 5. **Archivos Actualizados**

- `tsconfig.json` - Agregados 12 nuevos path aliases
- `vite.config.ts` - Agregados 12 nuevos alias resolvers
- `App.tsx` - Actualizado a alias @/
- `JobSearchScreen.tsx` - Actualizado a alias @/
- Todas las pantallas student - Actualizado a alias @/
- `LoginScreen.tsx` - Actualizado a alias @/
- `JobContext.tsx` - Actualizado a alias @/

## 📌 Convenciones de Importación

### ✅ CORRECTO

```typescript
// Alias para directorios principales
import { UserSession } from '@/types';
import Button from '@/components/Button';
import jobSearchService from '@/services/jobSearchService';
import { useJobs } from '@/context/JobContext';
import { JOB_TYPES } from '@/config/constants';
import { FIREBASE_CONFIG } from '@/config/env';
```

### ❌ EVITAR

```typescript
// Rutas relativas innecesarias
import { UserSession } from '../../types';
import Button from '../../components/Button';

// Importar directamente de src/constants (deprecado)
import { JOB_TYPES } from '@/constants';
```

## 🔄 Accesos a Directorios

| Directorio        | Acceso         | Descripción                |
| ----------------- | -------------- | -------------------------- |
| `src/config/`     | `@/config`     | Configuración centralizada |
| `src/components/` | `@/components` | Componentes React          |
| `src/screens/`    | `@/screens`    | Pantallas/páginas          |
| `src/services/`   | `@/services`   | Servicios de negocio       |
| `src/firebase/`   | `@/firebase`   | Config Firebase            |
| `src/context/`    | `@/context`    | Context API                |
| `src/hooks/`      | `@/hooks`      | Custom hooks               |
| `src/data/`       | `@/data`       | Datos mock/seed            |
| `src/types.ts`    | `@/types`      | Tipos TypeScript           |
| `src/utils/`      | `@/utils`      | Funciones utilitarias      |

## 📝 Notas Importantes

1. **Deprecación de `src/constants/`**: Usar `src/config/constants` en su lugar
2. **Alias de importación**: Siempre usar `@/` para paths absolutos
3. **Rutas relativas**: Solo para imports muy locales (opcional)
4. **Firebase**: La configuración está centralizada en `src/firebase/firebase.ts`
5. **Validación**: El proyecto está listo para compilar sin errors

## 🚀 Próximos Pasos

- [ ] Migrar funciones utilitarias a `src/utils/`
- [ ] Documentar servicios en `src/services/README.md`
- [ ] Crear archivo README en `src/components/`
- [ ] Organizar tipos por módulo (opcional)
