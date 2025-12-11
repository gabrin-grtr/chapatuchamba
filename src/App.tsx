import React, { useState, useEffect } from 'react';
import { Screen } from '@/types'; // Import Screen type from types.ts
import { useFirebaseAuth } from '@/firebase/firebase';
import { JobProvider } from '@/context/JobContext';

// Import layout components
import DesktopSidebar from '@/components/navigation/DesktopSidebar';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import MobileHeader from '@/components/navigation/MobileHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ScreenContent from '@/components/layout/ScreenContent';

import LoginScreen from './screens/auth/LoginScreen';

const App: React.FC = () => {
  // El hook de autenticación ahora maneja el login/registro internamente.
  // Se elimina la aserción de tipo `as UseAuthReturn` porque ya no es necesaria.
  const { currentUserSession, authLoading, userLogout } = useFirebaseAuth();
  
  // El 'userRole' es derivado directamente de 'currentUserSession'
  // const [userRole, setUserRole] = useState<Role>(null); // <- Eliminado
  const userRole = currentUserSession?.role || null;

  const [currentScreen, setCurrentScreen] = useState<Screen>('user_home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (currentUserSession) {
        // La pantalla se ajusta en base al rol de la sesión
        const role = currentUserSession.role;
        setCurrentScreen(role === 'admin' ? 'admin_dash' : 'user_home');
      }
    }
  }, [currentUserSession, authLoading]); // Este efecto establece la pantalla inicial correcta una vez que se carga la sesión.

  const handleLogout = () => userLogout();

  // Function to toggle mobile menu (passed to MobileHeader)
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Si no hay sesión de usuario, se renderiza la pantalla de login/registro.
  // Se asume que LoginScreen ahora contiene la lógica para registrarse e iniciar sesión.
  if (!currentUserSession) {
    return <LoginScreen />;
  }

  // Layout principal para usuarios autenticados
  return (
    <JobProvider>
      <div className="flex h-screen w-screen bg-gray-100 font-sans relative"> {/* Added relative for mobile menu positioning */}
        <DesktopSidebar
          userRole={userRole}
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          handleLogout={handleLogout}
        />

        {/* Mobile menu overlay (conditionally rendered) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}
        {/* Mobile sidebar (conditionally rendered, using DesktopSidebar for content) */}
        <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
          <DesktopSidebar
            userRole={userRole}
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            handleLogout={handleLogout}
            onItemClick={() => setIsMobileMenuOpen(false)} // Close menu on item click
          />
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <MobileHeader onMenuToggle={toggleMobileMenu} />
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <ScreenContent
              currentScreen={currentScreen}
              currentUserSession={currentUserSession!} // currentUserSession is guaranteed to be non-null here
              handleLogout={handleLogout}
            />
          </div>
        </main>

        <MobileBottomNav
          userRole={userRole}
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
        />
      </div>
    </JobProvider>
  );
};

export default App;
