import React from 'react';
import { Screen } from '@/types';

interface NavItemMobileProps {
  screen: Screen;
  icon: React.ElementType;
  label: string;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
}

const NavItemMobile: React.FC<NavItemMobileProps> = ({
  screen,
  icon: Icon,
  label,
  currentScreen,
  setCurrentScreen,
}) => {
  return (
    <button
      onClick={() => setCurrentScreen(screen)}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
        currentScreen === screen ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <Icon size={24} strokeWidth={currentScreen === screen ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
};

export default NavItemMobile;
