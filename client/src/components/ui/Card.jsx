import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-border-gray p-6 ${className}`}>
      {children}
    </div>
  );
}
