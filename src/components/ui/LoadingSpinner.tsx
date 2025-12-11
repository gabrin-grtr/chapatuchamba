import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <Loader className="animate-spin text-blue-600" size={48} />
    </div>
  );
};

export default LoadingSpinner;
