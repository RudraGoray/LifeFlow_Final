import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import usePolling from '../../hooks/usePolling';
import StatCard from '../../components/ui/StatCard';
import LiveDot from '../../components/ui/LiveDot';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Shield, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const formatType = (type) => type.replace('_POS', '+').replace('_NEG', '-');

export default function BloodBankDashboard() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);

  const { data, loading, lastUpdated } = usePolling(() => api.get('/dashboard/bloodbank').then(r => r.data), 30000, [user.orgId]);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await api.get('/tickets/pending');
        const merged = [
          ...(response.data.demandTickets || []).map(t => ({ ...t, type: 'DEMAND', source: 'Hospital', timestamp: t.createdAt })),
          ...(response.data.donationTickets || []).map(b => ({ ...b, type: 'DONATION', source: 'NGO', timestamp: b.submittedAt })),
        ];
        setQueue(merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (err) {
        console.error('Failed to fetch pending queue', err);
      }
    };
    fetchQueue();
    const timer = setInterval(fetchQueue, 30000);
    return () => clearInterval(timer);
  }, []);

  if (loading && !data) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl"></div>;

  const stats = data?.stats || {};

  const inventoryHealth = stats.inventoryHealth || {};
  const healthTiles = [
    { label: 'Critical', count: inventoryHealth.critical || 0, style: 'bg-red-50 border-red-200 text-red-900', iconColor: 'text-danger-red' },
    { label: 'Low', count: inventoryHealth.low || 0, style: 'bg-yellow-50 border-yellow-200 text-yellow-900', iconColor: 'text-warning-amber' },
    { label: 'Adequate', count: inventoryHealth.adequate || 0, style: 'bg-green-50 border-green-200 text-green-900', iconColor: 'text-success-green' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Blood Bank Operations</h1>
          <p className="text-muted-gray text-sm">Manage inventory levels and process incoming/outgoing tickets.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-success-green bg-green-50 border border-green-100 rounded-full px-3 py-1">
            <LiveDot />
            Live
            {lastUpdated && <span className="text-muted-gray font-normal">· {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          </span>
          <Link to="/bloodbank/tickets">
            <Button variant="primary">
              <Shield className="h-4 w-4 mr-2" />
              Manage Pending Tickets
            </Button>
          </Link>
        </div>
      </div>

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
        <Card className="flex flex-col justify-center items-center text-center bg-gray-50 border-dashed">
          <Link to="/bloodbank/tickets">
             <span className="text-primary-crimson font-medium hover:underline cursor-pointer">
               Review Pending Queue →
             </span>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-charcoal">Inventory Health</h3>
            {lastUpdated && <Badge variant="info">Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Badge>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {healthTiles.map((tile) => (
              <div key={tile.label} className={`p-4 rounded-xl border flex flex-col items-center justify-center ${tile.style}`}>
                <div className="text-xs uppercase font-bold tracking-wider opacity-75">{tile.label}</div>
                <div className="text-4xl font-extrabold my-2">{tile.count}</div>
                <div className="flex items-center gap-1 text-xs font-medium">
                  {tile.label === 'Critical' ? <AlertTriangle className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                  blood type{ tile.count === 1 ? '' : 's'}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-gray mt-4">
            Cross-bank inventory summary. Manage per-type levels in the ticket queue.
          </p>
        </Card>

        <Card className="lg:col-span-1">
          <h3 className="text-lg font-bold text-charcoal mb-4 border-b pb-2">Pending Ticket Queue</h3>
          <div className="space-y-4">
            {queue.length === 0 ? (
              <p className="text-sm text-muted-gray text-center py-4">No pending tickets.</p>
            ) : queue.slice(0, 6).map((ticket, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1 flex-shrink-0">
                   {ticket.type === 'DEMAND' ? <Clock className="h-5 w-5 text-yellow-500" /> : <Shield className="h-5 w-5 text-teal-500" />}
                </div>
                <div>
                  <p className="text-sm text-charcoal font-medium">
                    {ticket.source} - {formatType(ticket.bloodType)} ({ticket.units} units)
                  </p>
                  <p className="text-xs text-muted-gray mt-0.5">
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