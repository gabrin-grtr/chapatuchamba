// old path: src/services/admin.ts
// new path: src/types/admin.ts
// Comentario: Tipos específicos para la gestión de administradores.

import { UserPreferences } from './user';
import { Role } from './auth';

export interface UserForAdmin {
  id: string;
  role?: Role;
  email?: string;
  preferences?: Omit<UserPreferences, 'userId'>;
  [key: string]: unknown;
}
