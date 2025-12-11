# Guía Rápida de Importación - Alias @/

## Estructura de Path Aliases en el Proyecto

Todos los imports deben usar el prefijo `@/` para acceso absoluto desde la carpeta `src/`.

### Ejemplos de Uso

#### 1. Tipos

```typescript
import { UserSession, JobOffer } from '@/types';
import { Role } from '@/types';
```

#### 2. Componentes

```typescript
import Button from '@/components/Button';
import JobCard from '@/components/JobCard';
import { Modal } from '@/components/Modal';
```

#### 3. Pantallas

```typescript
import StudentHome from '@/screens/student/StudentHome';
import LoginScreen from '@/screens/auth/LoginScreen';
import AdminDashboard from '@/screens/admin/AdminDashboard';
```

#### 4. Servicios

```typescript
import jobSearchService from '@/services/jobSearchService';
import emailNotificationService from '@/services/emailNotificationService';
```

#### 5. Context

```typescript
import { useJobs } from '@/context/JobContext';
```

#### 6. Firebase

```typescript
import { useFirebaseAuth } from '@/firebase/firebase';
import { db, auth, storage } from '@/firebase/firebase';
```

#### 7. Configuración

```typescript
import { JOB_TYPES, EXPERIENCE_LEVELS, MODALITIES } from '@/config/constants';
import { FIREBASE_CONFIG, validateFirebaseConfig } from '@/config/env';
```

#### 8. Datos

```typescript
import { SEED_JOBS } from '@/data/seedData';
```

#### 9. Hooks Personalizados

```typescript
import { useJobRecommendations } from '@/hooks/useJobRecommendations';
```

#### 10. Utilidades

```typescript
// Agregar funciones utilitarias en src/utils/
import { formatCurrency } from '@/utils/formatters';
import { parseJobDescription } from '@/utils/parsing';
```

## Definición de Alias en Configuración

### tsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@/components": ["src/components"],
      "@/screens": ["src/screens"],
      "@/services": ["src/services"],
      "@/context": ["src/context"],
      "@/firebase": ["src/firebase"],
      "@/config": ["src/config"],
      "@/constants": ["src/config/constants"],
      "@/types": ["src/types"],
      "@/hooks": ["src/hooks"],
      "@/data": ["src/data"],
      "@/utils": ["src/utils"]
    }
  }
}
```

### vite.config.ts

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@/components': path.resolve(__dirname, 'src/components'),
    '@/screens': path.resolve(__dirname, 'src/screens'),
    '@/services': path.resolve(__dirname, 'src/services'),
    '@/context': path.resolve(__dirname, 'src/context'),
    '@/firebase': path.resolve(__dirname, 'src/firebase'),
    '@/config': path.resolve(__dirname, 'src/config'),
    '@/constants': path.resolve(__dirname, 'src/config/constants'),
    '@/types': path.resolve(__dirname, 'src/types'),
    '@/hooks': path.resolve(__dirname, 'src/hooks'),
    '@/data': path.resolve(__dirname, 'src/data'),
    '@/utils': path.resolve(__dirname, 'src/utils'),
  }
}
```

## Archivos Eliminados (Limpieza)

✅ **Archivos vacíos removidos:**

- `config.ts` (raíz)
- `email.ts` (raíz)
- `jobs.ts` (raíz)
- `index.ts` (raíz)

✅ **Archivos duplicados removidos:**

- `firebase.ts` (raíz) → Usar `@/firebase/firebase.ts`
- `constants.ts` (raíz) → Usar `@/config/constants.ts`

## Migración de Imports Antiguos

Si encuentras imports antiguos en el proyecto:

### Antes (Incorrecto)

```typescript
import { JOB_TYPES } from '../../constants';
import { db } from '../firebase';
import Button from '../../components/Button';
```

### Después (Correcto)

```typescript
import { JOB_TYPES } from '@/config/constants';
import { db } from '@/firebase/firebase';
import Button from '@/components/Button';
```

## Verificación de Compilación

Para asegurar que todos los imports están correctos:

```bash
# Compilar TypeScript sin emitir
npm run build

# En desarrollo
npm run dev
```

Si hay errores de módulos no encontrados, asegúrate de:

1. Usar `@/` en lugar de rutas relativas
2. Verificar que el archivo existe en la carpeta esperada
3. Revisar mayúsculas/minúsculas en los nombres
4. Reiniciar el servidor Vite (Ctrl+C y `npm run dev`)
