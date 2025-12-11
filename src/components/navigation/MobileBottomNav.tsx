import React from 'react';
import { Search, Bookmark, BarChart2, User, Monitor, Briefcase } from 'lucide-react';
import NavItemMobile from '@/components/navigation/NavItemMobile';
import { Role, Screen } from '@/types';

interface MobileBottomNavProps {
  userRole: Role;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  userRole,
  currentScreen,
  setCurrentScreen,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex justify-around items-center shadow-inner">
      {userRole === 'user' && (
        <>
          <NavItemMobile
            screen="user_home"
            icon={Search}
            label="Buscar"
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
          <NavItemMobile
            screen="saved"
            icon={Bookmark}
            label="Guardados"
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
          <NavItemMobile
            screen="reports"
            icon={BarChart2}
            label="Reportes"
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
          <NavItemMobile
            screen="profile"
            icon={User}
            label="Perfil"
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
        </>
      )}
      {userRole === 'admin' && (
        <NavItemMobile
          screen="admin_dash"
          icon={Monitor}
          label="Admin"
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
        />
      )}
      {userRole === 'recruiter' && (
        <NavItemMobile
          screen="recruiter_dash"
          icon={Briefcase}
          label="Portal"
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
        />
      )}
    </nav>
  );
};

export default MobileBottomNav;
