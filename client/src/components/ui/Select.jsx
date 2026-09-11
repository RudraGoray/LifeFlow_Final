import React from 'react';

export default function Select({ label, id, value, onChange, options, required, error, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-muted-gray uppercase tracking-wider">
          {label} {required && <span className="text-danger-red">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={!!error}
        className={`px-3 py-2 bg-white dark:bg-white/5 border rounded-lg text-sm text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-crimson focus:border-transparent transition-shadow ${
          error ? 'border-danger-red' : 'border-border-gray dark:border-white/10'
        }`}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-danger-red">{error}</p>}
    </div>
  );
}