import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-[#1C1917] rounded-xl shadow-sm border border-border-gray dark:border-white/10 p-6 ${className}`}>
      {children}
    </div>
  );
}
