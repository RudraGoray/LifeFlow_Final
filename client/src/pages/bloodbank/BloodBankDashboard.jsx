import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import usePolling from '../../hooks/usePolling';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/dashboard/PageHeader';
import InventoryGrid from '../../components/dashboard/InventoryGrid';
import { Shield, Clock, AlertTriangle, TrendingUp, Package, BarChart3 } from 'lucide-react';

const formatType = (type) => (type || '').replace('_POS', '+').replace('_NEG', '-');

export default function BloodBankDashboard() {
  const { user } = useAuth();
  const lastGood = useRef({ dashboard: null, queue: [] });

  // Single 30s tick fetches dashboard + queue together so both panels
  // always describe the same moment (previously two out-of-phase timers).
  // allSettled + last-good cache: one failing source keeps the other visible.
  const { data, loading, lastUpdated } = usePolling(async () => {
    const [dashSettled, queueSettled] = await Promise.allSettled([
      api.get('/dashboard/bloodbank'),
      api.get('/tickets/pending'),
    ]);
    if (dashSettled.status === 'fulfilled') {
      lastGood.current.dashboard = dashSettled.value.data;
    } else {
      console.error('Failed to fetch blood bank dashboard', dashSettled.reason);
    }
    if (queueSettled.status === 'fulfilled') {
      const q = queueSettled.value.data;
      const merged = [
        ...(q.demandTickets || []).map(t => ({ ...t, type: 'DEMAND', source: 'Hospital', timestamp: t.createdAt })),
        ...(q.donationTickets || []).map(b => ({ ...b, type: 'DONATION', source: 'NGO', timestamp: b.submittedAt })),
      ];
      lastGood.current.queue = merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else {
      console.error('Failed to fetch pending queue', queueSettled.reason);
    }
    if (dashSettled.status === 'rejected' && queueSettled.status === 'rejected' && !lastGood.current.dashboard) {
      throw new Error('Dashboard refresh failed');
    }
    return { ...lastGood.current };
  }, 30000, [user.orgId]);

  if (loading && !data) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-white/10 rounded-xl"></div>;

  const stats = data?.dashboard?.stats || {};
  const bank = data?.dashboard?.bank;
  const inventory = data?.dashboard?.inventory || [];
  const queue = data?.queue || [];

  const inventoryHealth = stats.inventoryHealth || {};
  const healthTiles = [
    { label: 'Critical', count: inventoryHealth.critical || 0, style: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-900 dark:text-red-300', iconColor: 'text-danger-red' },
    { label: 'Low', count: inventoryHealth.low || 0, style: 'bg-yellow-50 dark:bg-amber-500/10 border-yellow-200 dark:border-amber-500/30 text-yellow-900 dark:text-amber-300', iconColor: 'text-warning-amber' },
    { label: 'Adequate', count: inventoryHealth.adequate || 0, style: 'bg-green-50 dark:bg-emerald-500/10 border-green-200 dark:border-emerald-500/30 text-green-900 dark:text-emerald-300', iconColor: 'text-success-green' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blood Bank Operations"
        subtitle={bank ? `${bank.name} · manage inventory levels and process tickets.` : 'Manage inventory levels and process incoming/outgoing tickets.'}
        lastUpdated={lastUpdated}
        actions={
          <Link to="/bloodbank/tickets">
            <Button variant="primary">
              <Shield className="h-4 w-4 mr-2" />
              Manage Pending Tickets
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Approvals"
          value={stats.totalPending?.value ?? 0}
          trend={(stats.totalPending?.value ?? 0) > 5 ? 'High Volume' : 'Manageable'}
          isLive={(stats.totalPending?.value ?? 0) > 0}
        />
        <StatCard
          label="Confirmed Today"
          value={stats.confirmedToday?.value ?? 0}
          trend="Approved tickets"
        />
        <StatCard
          label="Rejected Today"
          value={stats.rejectedToday?.value ?? 0}
          trend="Declined tickets"
        />
        <Card className="flex flex-col justify-center items-center text-center bg-gray-50 dark:bg-white/5 border-dashed">
          <Link to="/bloodbank/tickets">
            <span className="text-primary-crimson dark:text-crimson-400 font-medium hover:underline cursor-pointer">
              Review Pending Queue →
            </span>
          </Link>
        </Card>
      </div>

      {/* Own-bank live inventory */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-charcoal dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-crimson" />
            {bank ? `${bank.name} — Live Stock` : 'Live Stock'}
          </h3>
          <div className="flex items-center gap-3">
            {lastUpdated && <Badge variant="info">Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Badge>}
            <Link to="/bloodbank/analytics" className="text-sm text-primary-crimson dark:text-crimson-400 hover:underline flex items-center gap-1">
              <BarChart3 className="h-4 w-4" /> Analytics
            </Link>
            <Link to="/bloodbank/inventory" className="text-sm text-primary-crimson dark:text-crimson-400 hover:underline">Manage Inventory</Link>
          </div>
        </div>
        {inventory.length > 0 ? (
          <InventoryGrid rows={inventory} compact />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {healthTiles.map((tile) => (
              <div key={tile.label} className={`p-4 rounded-xl border flex flex-col items-center justify-center ${tile.style}`}>
                <div className="text-xs uppercase font-bold tracking-wider opacity-75">{tile.label}</div>
                <div className="text-4xl font-extrabold my-2">{tile.count}</div>
                <div className="flex items-center gap-1 text-xs font-medium">
                  {tile.label === 'Critical' ? <AlertTriangle className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                  blood type{tile.count === 1 ? '' : 's'}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-gray dark:text-gray-400 mt-4">
          Confirming a donation batch automatically credits this stock and logs a ledger entry.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-charcoal dark:text-white">Inventory Health</h3>
            {lastUpdated && <Badge variant="info">Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Badge>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {healthTiles.map((tile) => (
              <div key={tile.label} className={`p-4 rounded-xl border flex flex-col items-center justify-center ${tile.style}`}>
                <div className="text-xs uppercase font-bold tracking-wider opacity-75">{tile.label}</div>
                <div className="text-4xl font-extrabold my-2">{tile.count}</div>
                <div className="flex items-center gap-1 text-xs font-medium">
                  {tile.label === 'Critical' ? <AlertTriangle className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                  blood type{tile.count === 1 ? '' : 's'}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-gray dark:text-gray-400 mt-4">
            Cross-bank inventory summary. Manage per-type levels on the inventory page.
          </p>
        </Card>

        <Card className="lg:col-span-1">
          <h3 className="text-lg font-bold text-charcoal dark:text-white mb-4 border-b border-border-gray dark:border-white/10 pb-2">Pending Ticket Queue</h3>
          <div className="space-y-4">
            {queue.length === 0 ? (
              <p className="text-sm text-muted-gray dark:text-gray-400 text-center py-4">No pending tickets.</p>
            ) : queue.slice(0, 6).map((ticket, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1 flex-shrink-0">
                  {ticket.type === 'DEMAND' ? <Clock className="h-5 w-5 text-yellow-500" /> : <Shield className="h-5 w-5 text-teal-500" />}
                </div>
                <div>
                  <p className="text-sm text-charcoal dark:text-white font-medium">
                    {ticket.source} - {formatType(ticket.bloodType)} ({ticket.units} units)
                  </p>
                  <p className="text-xs text-muted-gray dark:text-gray-400 mt-0.5">
                    PENDING • {new Date(ticket.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
