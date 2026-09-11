import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import usePolling from '../../hooks/usePolling';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/dashboard/PageHeader';
import { DualBarChart } from '../../components/charts/DualBarChart';
import { LineAreaChart } from '../../components/charts/LineAreaChart';

import usePageTitle from '../../hooks/usePageTitle';

export default function NGOAnalytics() {
  usePageTitle('Impact Analytics');
  const [months, setMonths] = useState(6);
  const { data, loading, lastUpdated } = usePolling(
    () => api.get(`/dashboard/ngo/impact?months=${months}`).then((r) => r.data),
    60000,
    [months]
  );

  const buckets = data?.monthly || [];
  const growth = data?.growth || [];
  const totals = data?.totals || { collected: 0, confirmed: 0, pending: 0, donorsInRegion: 0 };
  const topCamps = data?.topCamps || [];

  if (loading && !data) {
    return <div className="animate-pulse h-64 bg-gray-200 dark:bg-white/10 rounded-xl"></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Impact Analytics"
        subtitle="Collections, donor growth and camp impact over time."
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
            <Link to="/ngo/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-gray dark:text-gray-400">Units Collected</div>
          <div className="text-4xl font-extrabold text-success-green dark:text-emerald-400 my-1">{totals.collected}</div>
          <div className="text-xs text-muted-gray dark:text-gray-400">confirmed · full history in range</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-gray dark:text-gray-400">Donors in Region</div>
          <div className="text-4xl font-extrabold text-charcoal dark:text-white my-1">{totals.donorsInRegion}</div>
          <div className="text-xs text-muted-gray dark:text-gray-400">registered donor pool</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-gray dark:text-gray-400">Batch Funnel</div>
          <div className="text-4xl font-extrabold text-charcoal dark:text-white my-1">
            {totals.confirmed}<span className="text-lg text-muted-gray dark:text-gray-400"> / {totals.confirmed + totals.pending}</span>
          </div>
          <div className="text-xs text-muted-gray dark:text-gray-400">confirmed vs submitted</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-charcoal dark:text-white mb-4">Units Collected vs New Donors — Monthly</h3>
          <DualBarChart
            data={buckets}
            xKey="month"
            bar1Key="collected"
            bar2Key="donors"
            bar1Name="Units collected"
            bar2Name="New donors"
          />
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-charcoal dark:text-white mb-4">Donor Pool Growth</h3>
          <LineAreaChart data={growth} xKey="month" yKey="total" color="#059669" />
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-charcoal dark:text-white mb-4">Top Camps by Impact</h3>
        {topCamps.length === 0 ? (
          <p className="text-sm text-muted-gray dark:text-gray-400 text-center py-4">No camp data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-gray dark:border-white/10">
                  <th className="pb-2 text-xs text-muted-gray dark:text-gray-400 uppercase">Camp</th>
                  <th className="pb-2 text-xs text-muted-gray dark:text-gray-400 uppercase text-right">Batches</th>
                  <th className="pb-2 text-xs text-muted-gray dark:text-gray-400 uppercase text-right">Donors</th>
                  <th className="pb-2 text-xs text-muted-gray dark:text-gray-400 uppercase text-right">Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray dark:divide-white/10">
                {topCamps.map((c) => (
                  <tr key={c.campName}>
                    <td className="py-2.5 text-sm font-semibold text-charcoal dark:text-white">{c.campName}</td>
                    <td className="py-2.5 text-sm text-charcoal dark:text-white text-right">{c.batches}</td>
                    <td className="py-2.5 text-sm text-charcoal dark:text-white text-right">{c.donors}</td>
                    <td className="py-2.5 text-sm font-bold text-success-green dark:text-emerald-400 text-right">{c.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
