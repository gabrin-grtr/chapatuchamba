// old path: src/components/layout/ScreenContent.tsx
// new path: src/components/layout/ScreenContent.tsx
// Comentario: Se han actualizado las rutas de importación para reflejar el cambio de 'screens/student' a 'screens/user' y el renombramiento de 'GuardadoScreen'.

import React from 'react';
import { Screen, UserSession } from '@/types';

// Importa todas las pantallas que se possono renderizar en el layout principal
import AdminDashboard from '@/screens/admin/AdminDashboardScreen';
import JobSearchScreen from '@/screens/user/JobSearchScreen';
import PreferencesScreen from '@/screens/user/PreferencesScreen';
import ProfileScreen from '@/screens/user/ProfileScreen';
import SavedJobsScreen from '@/screens/user/SavedJobsScreen';
import NotificationsScreen from '@/screens/user/NotificationsScreen';

interface ScreenContentProps {
  currentScreen: Screen;
  currentUserSession: UserSession;
  handleLogout: () => void;
}

// Un mapa para renderizar la pantalla correcta de forma limpia y escalable.
const screenMap: {
  [key in Screen]?: React.ComponentType<Omit<ScreenContentProps, 'currentScreen'>>;
} = {
  user_home: JobSearchScreen,
  saved: SavedJobsScreen,
  profile: ProfileScreen,
  preferences: PreferencesScreen,
  // Añadida la pantalla de notificaciones para que coincida con la barra lateral.
  notifications: NotificationsScreen,
  admin_dash: AdminDashboard,
};

const ScreenContent: React.FC<ScreenContentProps> = ({ currentScreen, ...props }) => {
  const ScreenComponent = screenMap[currentScreen];

  if (ScreenComponent) {
    // Pasa todas las props restantes (currentUserSession, handleLogout) a la pantalla
    return <ScreenComponent {...props} />;
  }

  // Fallback para cualquier pantalla no implementada
  return <div>Pantalla &quot;{currentScreen}&quot; no encontrada.</div>;
};

export default ScreenContent;
