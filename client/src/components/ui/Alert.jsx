import React from 'react';

const alertStyles = {
  hospital: 'bg-red-50 text-red-800 border-red-200',
  ngo: 'bg-pink-50 text-pink-800 border-pink-200',
  bloodbank: 'bg-blue-50 text-blue-800 border-blue-200',
  default: 'bg-gray-50 text-gray-800 border-gray-200',
};

export default function Alert({ children, role = 'default', className = '' }) {
  return (
    <div className={`p-4 rounded-lg border text-sm font-medium ${alertStyles[role] || alertStyles.default} ${className}`}>
      {children}
    </div>
  );
}
