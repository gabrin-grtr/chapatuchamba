import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  icon?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon,
  children,
  isLoading = false,
  className,
  disabled,
  fullWidth = false,
  ...props
}) => {
  let baseStyles =
    'inline-flex items-center justify-center font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed';

  switch (variant) {
    case 'secondary':
      baseStyles += ' bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 shadow-none';
      break;
    case 'danger':
      baseStyles += ' bg-red-600 text-white hover:bg-red-700 shadow-red-600/30';
      break;
    case 'outline':
      baseStyles += ' bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 shadow-none';
      break;
    case 'ghost':
      baseStyles += ' bg-transparent text-gray-600 hover:bg-gray-100 shadow-none';
      break;
    case 'primary':
    default:
      baseStyles += ' bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30';
      break;
  }

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${widthStyle} ${className || ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5 mr-3 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <>
          {icon && <span className={`mr-2 ${children ? '' : 'm-0'}`}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
