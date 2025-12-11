import React from 'react';
import { Screen } from '@/types';

interface SidebarItemProps {
  screen: Screen;
  icon: React.ElementType;
  label: string;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  onItemClick?: () => void; // Optional callback for when an item is clicked (e.g., to close mobile menu)
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  screen,
  icon: Icon,
  label,
  currentScreen,
  setCurrentScreen,
  onItemClick,
}) => {
  return (
    <button
      onClick={() => {
        setCurrentScreen(screen);
        onItemClick?.(); // Call optional click handler
      }}
      className={`flex items-center w-full px-4 py-3 rounded-xl mb-2 transition-all duration-200 group ${
        currentScreen === screen
          ? 'bg-blue-100 text-blue-700 font-bold shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon size={20} className={`mr-3 ${currentScreen === screen ? 'stroke-[2.5px]' : ''}`} />
      {label}
    </button>
  );
};

export default SidebarItem;
