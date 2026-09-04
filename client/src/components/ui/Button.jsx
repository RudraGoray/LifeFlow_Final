import React from 'react';

const variantStyles = {
  primary: 'bg-primary-crimson text-white hover:bg-primary-crimson-dark border border-transparent',
  secondary: 'bg-white text-charcoal border border-border-gray hover:bg-gray-50',
  danger: 'bg-danger-red text-white hover:bg-red-700 border border-transparent',
  ghost: 'bg-transparent text-charcoal hover:bg-gray-100 border border-transparent',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  type = 'button', 
  disabled = false,
  onClick
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-crimson disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
}
