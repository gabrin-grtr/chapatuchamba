import React from 'react';
import {
  Briefcase,
  Search,
  Bookmark,
  Bell,
  User,
  Settings,
  LogOut,
  Monitor,
} from 'lucide-react';
import SidebarItem from '@/components/navigation/SidebarItem';
import { Role, Screen } from '@/types';

interface DesktopSidebarProps {
  userRole: Role;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  handleLogout: () => void;
  onItemClick?: () => void; // Optional prop to handle clicks, e.g., close mobile menu
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  userRole,
  currentScreen,
  setCurrentScreen,
  handleLogout,
  onItemClick,
}) => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4">
      <div className="flex items-center mb-8">
        <Briefcase className="text-blue-600" size={32} />
        <h1 className="text-2xl font-bold text-gray-800 ml-2">ChapaTuChamba</h1>
      </div>
      <nav className="flex-1">
        {userRole === 'user' && (
          <>
            <SidebarItem
              screen="user_home"
              icon={Search}
              label="Buscar Empleos"
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              onItemClick={onItemClick}
            />
            <SidebarItem
              screen="saved"
              icon={Bookmark}
              label="Guardados"
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              onItemClick={onItemClick}
            />
            <SidebarItem
              screen="notifications"
              icon={Bell}
              label="Notificaciones"
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              onItemClick={onItemClick}
            />
          </>
        )}
        {userRole === 'admin' && (
          <SidebarItem
            screen="admin_dash"
            icon={Monitor}
            label="Admin Dashboard"
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            onItemClick={onItemClick}
          />
        )}
        
      </nav>
      <div className="mt-auto">
        <SidebarItem
          screen="profile"
          icon={User}
          label="Mi Perfil"
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          onItemClick={onItemClick}
        />
        <SidebarItem
          screen="preferences"
          icon={Settings}
          label="Preferencias"
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          onItemClick={onItemClick}
        />
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <LogOut size={20} className="mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
