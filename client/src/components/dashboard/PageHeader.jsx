import React from 'react';
import LiveDot from '../ui/LiveDot';

export default function PageHeader({ title, subtitle, lastUpdated, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <div>
        <h1 className="text-2xl font-bold text-charcoal dark:text-white">{title}</h1>
        {subtitle && <p className="text-muted-gray dark:text-gray-400 text-sm">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-success-green dark:text-emerald-400 bg-green-50 dark:bg-emerald-500/10 border border-green-100 dark:border-emerald-500/20 rounded-full px-3 py-1">
          <LiveDot />
          Live
          {lastUpdated && (
            <span className="text-muted-gray dark:text-gray-400 font-normal">
              · {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </span>
        {actions}
      </div>
    </div>
  );
}
