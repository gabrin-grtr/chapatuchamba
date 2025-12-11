import React from 'react';
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  onMenuToggle: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="md:hidden flex items-center justify-between p-4 bg-white border-b">
      <h1 className="text-xl font-bold text-blue-600">ChapaTuChamba</h1>
      <button onClick={onMenuToggle}>
        <Menu size={24} />
      </button>
    </header>
  );
};

export default MobileHeader;
