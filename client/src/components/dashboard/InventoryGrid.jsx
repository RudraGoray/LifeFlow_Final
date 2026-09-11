import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const BLOOD_TYPE_LABELS = {
  A_POS: 'A+', A_NEG: 'A-', B_POS: 'B+', B_NEG: 'B-',
  AB_POS: 'AB+', AB_NEG: 'AB-', O_POS: 'O+', O_NEG: 'O-',
};

export const BLOOD_TYPE_ORDER = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];

const STATUS_STYLES = {
  CRITICAL: {
    card: 'border-red-200 dark:border-red-500/30 bg-red-50/60 dark:bg-red-500/10',
    text: 'text-red-800 dark:text-red-300',
    badge: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300',
  },
  LOW: {
    card: 'border-yellow-200 dark:border-amber-500/30 bg-yellow-50/60 dark:bg-amber-500/10',
    text: 'text-yellow-800 dark:text-amber-300',
    badge: 'bg-yellow-100 dark:bg-amber-500/20 text-yellow-800 dark:text-amber-300',
  },
  ADEQUATE: {
    card: 'border-border-gray dark:border-white/10 bg-white dark:bg-white/5',
    text: 'text-charcoal dark:text-white',
    badge: 'bg-green-100 dark:bg-emerald-500/20 text-green-800 dark:text-emerald-300',
  },
};

function normalizeRow(row) {
  const key = row.bloodType?.includes('_') ? row.bloodType : row.bloodType;
  return { ...row, key };
}

/**
 * Per-type stock grid. `rows` items: { bloodType, units, statusLevel }.
 * `onAdjust` (optional) renders a per-card adjust button.
 */
export default function InventoryGrid({ rows = [], onAdjust, compact = false }) {
  const sorted = [...rows].sort(
    (a, b) => BLOOD_TYPE_ORDER.indexOf(a.bloodType) - BLOOD_TYPE_ORDER.indexOf(b.bloodType)
  );

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-gray dark:text-gray-400 text-center py-6">No inventory data yet.</p>;
  }

  return (
    <div className={`grid grid-cols-2 ${compact ? 'sm:grid-cols-4' : 'sm:grid-cols-4'} gap-3`}>
      {sorted.map((input) => {
        const row = normalizeRow(input);
        const style = STATUS_STYLES[row.statusLevel] || STATUS_STYLES.ADEQUATE;
        return (
          <div key={row.key} className={`rounded-xl border p-4 flex flex-col items-center text-center transition-colors ${style.card}`}>
            <div className="font-heading font-extrabold text-lg text-charcoal dark:text-white">
              {BLOOD_TYPE_LABELS[row.key] || row.bloodType}
            </div>
            <div className={`font-heading font-extrabold my-1 ${compact ? 'text-2xl' : 'text-3xl'} ${style.text}`}>
              {row.units}
              <span className="text-xs font-body font-medium opacity-70 ml-1">units</span>
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}>
              {row.statusLevel === 'CRITICAL' && <AlertTriangle className="h-3 w-3" />}
              {row.statusLevel}
            </span>
            {onAdjust && (
              <button
                type="button"
                onClick={() => onAdjust(row)}
                className="mt-2 text-xs font-semibold text-crimson hover:text-crimson-700 dark:text-crimson-400 dark:hover:text-crimson-300 hover:underline"
              >
                Adjust
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
