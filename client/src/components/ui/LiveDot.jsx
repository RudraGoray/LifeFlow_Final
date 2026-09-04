import React from 'react';

export default function LiveDot({ className = '' }) {
  return (
    <span className={`relative flex h-3 w-3 ${className}`}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-green opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-success-green"></span>
    </span>
  );
}
