import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import usePolling from '../../hooks/usePolling';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/dashboard/PageHeader';
import InventoryGrid from '../../components/dashboard/InventoryGrid';
import { LineAreaChart } from '../../components/charts/LineAreaChart';
import { AlertCircle, Clock, CheckCircle, Link as LinkIcon, Package, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatType = (type) => (type || '').replace('_POS', '+').replace('_NEG', '-');

import usePageTitle from '../../hooks/usePageTitle';

export default function HospitalDashboard() {
  usePageTitle('Hospital Dashboard');
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [trend, setTrend] = useState([]);

  // Stats and feed poll independently: a failing feed must not blank the stats.
  const { data: statsData, loading: statsLoading, lastUpdated } = usePolling(
    () => api.get('/dashboard/hospital').then((r) => r.data),
    30000,
    [user.orgId]
  );
  const { data: feedData } = usePolling(
    () => api.get(`/dashboard/feed/${user.orgId}`).then((r) => r.data.feed || r.data || []),
    30000,
    [user.orgId]
  );

  useEffect(() => {
    const fetchStatic = async () => {
      const [ticketsRes, trendRes] = await Promise.allSettled([
        api.get('/tickets/demand'),
        api.get('/stats/monthly'),
      ]);
      if (ticketsRes.status === 'fulfilled') {
        setTickets(ticketsRes.value.data.tickets || []);
      } else {
        console.error('Failed to fetch demand tickets', ticketsRes.reason);
      }
      if (trendRes.status === 'fulfilled') {
        setTrend(trendRes.value.data || []);
      } else {
        console.error('Failed to fetch trend data', trendRes.reason);
      }
    };
    fetchStatic();
  }, []);

  if (statsLoading && !statsData) return <div className="animate-pulse space-y-6">
    <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
    <div className="h-64 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
  </div>;

  const stats = statsData?.stats || {};
  const feed = feedData || [];
  const inventory = statsData?.inventory || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital Operations"
        subtitle="Real-time overview of demand tickets, fridge stock and supply."
        lastUpdated={lastUpdated}
        actions={
          <Link to="/hospital/demand-tickets/new">
            <Button variant="danger">
              <AlertCircle className="h-4 w-4 mr-2" />
              Raise Emergency Demand
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Pending Tickets"
          value={stats.activeTickets?.value ?? 0}
          subtext={`${stats.activeTickets?.raisedToday ?? 0} raised today`}
          isLive={(stats.activeTickets?.value ?? 0) > 0}
        />
        <StatCard
          label="Critical Demands"
          value={stats.criticalShortages?.value ?? 0}
          trend={(stats.criticalShortages?.value ?? 0) > 0 ? 'High Alert' : 'Stable'}
          subtext={stats.criticalShortages?.types?.join(', ')}
        />
        <StatCard
          label="Fridge Stock"
          value={`${stats.fridgeUnits?.value ?? 0} units`}
          trend={(stats.fridgeCritical?.value ?? 0) > 0 ? `${stats.fridgeCritical.value} types critical` : 'All types stocked'}
        />
        <StatCard
          label="Fulfillment Rate"
          value={`${stats.fulfillmentRate?.value ?? 0}%`}
          trend={stats.fulfillmentRate?.trend || ''}
          sample
        />
      </div>

      {/* Fridge inventory snapshot */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-charcoal dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-crimson" /> Fridge Inventory
          </h3>
          <div className="flex items-center gap-3">
            <Link to="/hospital/analytics" className="text-sm text-primary-crimson dark:text-crimson-400 hover:underline flex items-center gap-1">
              <BarChart3 className="h-4 w-4" /> Analytics
            </Link>
            <Link to="/hospital/inventory" className="text-sm text-primary-crimson dark:text-crimson-400 hover:underline">Manage Stock</Link>
          </div>
        </div>
        <InventoryGrid rows={inventory} compact />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-charcoal dark:text-white">Demand Trend (Monthly)</h3>
              <Link to="/statistics/overview" className="text-sm text-primary-crimson dark:text-crimson-400 hover:underline">View Analytics</Link>
            </div>
            <LineAreaChart data={trend} xKey="month" yKey="demanded" color="#B91C3C" />
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-charcoal dark:text-white">Recent Tickets</h3>
              <Link to="/hospital/demand-tickets" className="text-sm text-primary-crimson dark:text-crimson-400 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-gray dark:border-white/10">
                    <th className="pb-2 text-xs text-muted-gray dark:text-gray-400 uppercase">ID</th>
                    <th className="pb-2 text-xs text-muted-gray dark:text-gray-400 uppercase">Blood Type</th>
                    <th className="pb-2 text-xs text-muted-gray dark:text-gray-400 uppercase">Urgency</th>
                    <th className="pb-2 text-xs text-muted-gray dark:text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gray dark:divide-white/10">
                  {tickets.length === 0 ? (
                    <tr><td colSpan={4} className="py-6 text-center text-sm text-muted-gray dark:text-gray-400">No tickets yet. Raise your first demand ticket to get started.</td></tr>
                  ) : tickets.slice(0, 6).map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="py-3 text-sm font-medium text-charcoal dark:text-white">#{ticket.id.substring(0, 6)}</td>
                      <td className="py-3 text-sm text-charcoal dark:text-white">{formatType(ticket.bloodType)}</td>
                      <td className="py-3">
                        <Badge variant={ticket.urgency === 'CRITICAL' ? 'danger' : ticket.urgency === 'HIGH' ? 'warning' : 'default'}>
                          {ticket.urgency}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {ticket.status === 'PENDING' ? <span className="flex items-center text-xs text-yellow-600 dark:text-amber-400"><Clock className="w-3 h-3 mr-1" /> Pending</span> :
                          ticket.status === 'CONFIRMED' ? <span className="flex items-center text-xs text-blue-600 dark:text-blue-400"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</span> :
                            <span className="flex items-center text-xs text-green-600 dark:text-emerald-400"><CheckCircle className="w-3 h-3 mr-1" /> Fulfilled</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Operational Feed */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-charcoal dark:text-white mb-4 border-b border-border-gray dark:border-white/10 pb-2">Operational Feed</h3>
            <div className="space-y-4">
              {feed.length === 0 ? (
                <p className="text-sm text-muted-gray dark:text-gray-400 text-center py-4">No recent activity.</p>
              ) : feed.slice(0, 8).map((item, i) => (
                <div key={i} className="flex gap-3 relative">
                  {i !== Math.min(feed.length, 8) - 1 && <div className="absolute left-2.5 top-6 bottom-0 w-px bg-border-gray dark:bg-white/10 -z-10"></div>}
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 border-2 border-white dark:border-[#1C1917] ${
                    item.type === 'demand' ? 'bg-yellow-400' : 'bg-teal-400'
                  }`}></div>
                  <div>
                    <p className="text-sm text-charcoal dark:text-white font-medium">{item.title}</p>
                    {item.detail && <p className="text-xs text-muted-gray dark:text-gray-400 mt-0.5">{item.detail}</p>}
                    <p className="text-xs text-muted-gray dark:text-gray-400 mt-0.5">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Link to="/hospital/blood-availability">
            <Card className="flex flex-col justify-center items-center text-center bg-gray-50 dark:bg-white/5 border-dashed hover:border-primary-crimson/40 transition-colors">
              <LinkIcon className="h-6 w-6 text-primary-crimson dark:text-crimson-400 mb-2" />
              <span className="text-primary-crimson dark:text-crimson-400 font-medium hover:underline cursor-pointer">
                Check Regional Availability →
              </span>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
