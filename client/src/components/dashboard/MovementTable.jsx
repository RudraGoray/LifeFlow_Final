import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { BLOOD_TYPE_LABELS } from './InventoryGrid';

const REASON_LABELS = {
  DONATION_CONFIRMED: 'Donation confirmed',
  DEMAND_RECEIVED: 'Demand received',
  MANUAL_RECEIPT: 'Manual receipt',
  DISPATCH_TO_HOSPITAL: 'Dispatched to hospital',
  TRANSFUSION_USED: 'Transfusion used',
  EXPIRED: 'Expired',
  ADJUSTMENT: 'Adjustment',
};

export default function MovementTable({ movements = [] }) {
  if (movements.length === 0) {
    return <p className="text-sm text-muted-gray dark:text-gray-400 text-center py-4">No movements recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border-gray dark:border-white/10">
            <th className="pb-2 text-xs text-muted-gray dark:text-gray-400 uppercase">Movement</th>
            <th className="pb-2 text-xs text-muted-gray dark:text-gray-400 uppercase">Type</th>
            <th className="pb-2 text-xs text-muted-gray dark:text-gray-400 uppercase">Units</th>
            <th className="pb-2 text-xs text-muted-gray dark:text-gray-400 uppercase hidden sm:table-cell">Reason</th>
            <th className="pb-2 text-xs text-muted-gray dark:text-gray-400 uppercase text-right">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-gray dark:divide-white/10">
          {movements.map((m) => (
            <tr key={m.id}>
              <td className="py-2.5">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                  m.direction === 'IN' ? 'text-success-green dark:text-emerald-400' : 'text-crimson dark:text-crimson-400'
                }`}>
                  {m.direction === 'IN'
                    ? <ArrowDownToLine className="h-3.5 w-3.5" />
                    : <ArrowUpFromLine className="h-3.5 w-3.5" />}
                  {m.direction}
                </span>
              </td>
              <td className="py-2.5 text-sm font-semibold text-charcoal dark:text-white">
                {m.bloodTypeLabel || BLOOD_TYPE_LABELS[m.bloodType] || m.bloodType}
              </td>
              <td className="py-2.5 text-sm text-charcoal dark:text-white">{m.units}</td>
              <td className="py-2.5 text-xs text-muted-gray dark:text-gray-400 hidden sm:table-cell">
                {REASON_LABELS[m.reason] || m.reason}
                {m.note && <span className="block italic">{m.note}</span>}
              </td>
              <td className="py-2.5 text-xs text-muted-gray dark:text-gray-400 text-right">
                {new Date(m.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
