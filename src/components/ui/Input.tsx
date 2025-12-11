import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ElementType;
  className?: string;
}

const Input: React.FC<InputProps> = ({ label, icon: Icon, className, id, ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s/g, '-') : undefined);

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex items-center">
        {Icon && (
          <div className="absolute left-3 text-gray-400 pointer-events-none">
            <Icon size={20} />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all ${
            Icon ? 'pl-10' : 'pl-4'
          } ${className || ''}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;
