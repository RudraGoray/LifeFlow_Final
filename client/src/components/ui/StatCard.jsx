import React from 'react';
import Card from './Card';
import LiveDot from './LiveDot';

export default function StatCard({ label, value, trend, subtext, isLive, sample }) {
  return (
    <Card className="flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-muted-gray uppercase tracking-wider">{label}</h3>
        {isLive && <LiveDot />}
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-3xl font-extrabold text-charcoal dark:text-white">{value}</span>
        {sample && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-amber-500/20 text-yellow-800 dark:text-amber-300 border border-yellow-200 dark:border-amber-500/30">
            Sample Data
          </span>
        )}
        {trend && (
          <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-success-green' : 'text-danger-red'}`}>
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-muted-gray mt-2">{subtext}</p>}
    </Card>
  );
}
