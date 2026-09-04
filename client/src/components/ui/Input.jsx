import React from 'react';

export default function Input({ label, id, type = 'text', placeholder, value, onChange, required, error, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-muted-gray uppercase tracking-wider">
          {label} {required && <span className="text-danger-red">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={!!error}
        className={`px-3 py-2 bg-white border rounded-lg text-sm text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-crimson focus:border-transparent transition-shadow ${
          error ? 'border-danger-red' : 'border-border-gray'
        }`}
      />
      {error && <p className="text-xs font-medium text-danger-red">{error}</p>}
    </div>
  );
}