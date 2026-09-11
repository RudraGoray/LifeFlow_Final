import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import usePolling from '../../hooks/usePolling';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PageHeader from './PageHeader';
import MovementTable from './MovementTable';
import { DualBarChart } from '../charts/DualBarChart';
import { BLOOD_TYPE_LABELS } from './InventoryGrid';

/**
 * Gained-vs-used analytics from the stock ledger.
 * Props: gainedLabel, usedLabel, subtitle, backLink, backLabel
 */
export default function GainedVsUsed({ gainedLabel, usedLabel, subtitle, backLink, backLabel }) {
  const [months, setMonths] = useState(6);
  const { data, loading, lastUpdated } = usePolling(
    () => api.get(`/inventory/movements?months=${months}`).then((r) => r.data),
    60000,
    [months]
  );

  const monthly = data?.monthly || [];
  const byType = data?.byType || [];
  const totals = data?.totals || { gained: 0, used: 0 };
  const recent = data?.recent || [];
  const net = totals.gained - totals.used;

  if (loading && !data) {
    return <div className="animate-pulse h-64 bg-gray-200 dark:bg-white/10 rounded-xl"></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Analytics"
        subtitle={subtitle}
        lastUpdated={lastUpdated}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-gray-100 dark:bg-white/10 rounded-lg">
              {[3, 6, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    months === m
                      ? 'bg-white dark:bg-white/10 shadow-sm text-charcoal dark:text-white'
                      : 'text-muted-gray dark:text-gray-400 hover:text-charcoal dark:hover:text-white'
                  }`}
                >
                  {m}M
                </button>
              ))}
            </div>
            <Link to={backLink}>
              <Button variant="secondary">{backLabel}</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-gray dark:text-gray-400">{gainedLabel}</div>
          <div className="text-4xl font-extrabold text-success-green dark:text-emerald-400 my-1">{totals.gained}</div>
          <div className="text-xs text-muted-gray dark:text-gray-400">units · last {months} months</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-gray dark:text-gray-400">{usedLabel}</div>
          <div className="text-4xl font-extrabold text-crimson my-1">{totals.used}</div>
          <div className="text-xs text-muted-gray dark:text-gray-400">units · last {months} months</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-gray dark:text-gray-400">Net Position</div>
          <div className={`text-4xl font-extrabold my-1 ${net >= 0 ? 'text-charcoal dark:text-white' : 'text-danger-red'}`}>
            {net >= 0 ? '+' : ''}{net}
          </div>
          <div className="text-xs text-muted-gray dark:text-gray-400">units · gained minus used</div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-charcoal dark:text-white mb-4">
          {gainedLabel} vs {usedLabel} — Monthly
        </h3>
        <DualBarChart
          data={monthly}
          xKey="month"
          bar1Key="gained"
          bar2Key="used"
          bar1Name={gainedLabel}
          bar2Name={usedLabel}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-charcoal dark:text-white mb-4">Per Blood Type</h3>
          <div className="space-y-3">
            {byType.length === 0 && (
              <p className="text-sm text-muted-gray dark:text-gray-400 text-center py-4">No movements in this period.</p>
            )}
            {byType.map((t) => {
              const max = Math.max(t.gained, t.used, 1);
              return (
                <div key={t.bloodType}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-charcoal dark:text-white">{t.bloodType}</span>
                    <span className="text-muted-gray dark:text-gray-400">
                      <span className="text-success-green dark:text-emerald-400 font-semibold">+{t.gained}</span>
                      {' / '}
                      <span className="text-crimson font-semibold">−{t.used}</span>
                    </span>
                  </div>
                  <div className="flex gap-1 h-2.5">
                    <div className="rounded-full bg-success-green/70" style={{ width: `${(t.gained / max) * 50}%` }} />
                    <div className="rounded-full bg-crimson/70" style={{ width: `${(t.used / max) * 50}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-gray dark:text-gray-400 mt-4">
            Labels use clinical notation ({Object.values(BLOOD_TYPE_LABELS).slice(0, 4).join(', ')}…).
          </p>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-charcoal dark:text-white mb-4">Recent Movements</h3>
          <MovementTable movements={recent.slice(0, 8)} />
        </Card>
      </div>
    </div>
  );
}
