// old path: src/services/common.ts
// new path: src/types/common.ts
// Comentario: Tipos comunes y de utilidad para la UI.

// Define los identificadores únicos para cada pantalla principal de la aplicación.
export type Screen =
  | 'user_home'
  | 'saved'
  | 'profile'
  | 'preferences'
  | 'notification_settings' // Añadido para la nueva pantalla de ajustes.
  | 'admin_dash';
