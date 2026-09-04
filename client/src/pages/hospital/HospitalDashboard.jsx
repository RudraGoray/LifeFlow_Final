import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import usePolling from '../../hooks/usePolling';
import StatCard from '../../components/ui/StatCard';
import LiveDot from '../../components/ui/LiveDot';
import { LineAreaChart } from '../../components/charts/LineAreaChart';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { AlertCircle, Clock, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const formatType = (type) => type.replace('_POS', '+').replace('_NEG', '-');

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [trend, setTrend] = useState([]);

  const { data, loading, lastUpdated } = usePolling(async () => {
    const [statsRes, feedRes] = await Promise.all([
      api.get('/dashboard/hospital'),
      api.get(`/dashboard/feed/${user.orgId}`),
    ]);
    return { stats: statsRes.data, feed: feedRes.data.feed || feedRes.data || [] };
  }, 30000, [user.orgId]);

  useEffect(() => {
    const fetchStatic = async () => {
      try {
        const [ticketsRes, trendRes] = await Promise.all([
          api.get('/tickets/demand'),
          api.get('/stats/monthly'),
        ]);
        setTickets(ticketsRes.data.tickets || []);
        setTrend(trendRes.data || []);
      } catch (err) {
        console.error('Failed to fetch ticket/trend data', err);
      }
    };
    fetchStatic();
  }, []);

  if (loading && !data) return <div className="animate-pulse space-y-6">
    <div className="h-32 bg-gray-200 rounded-xl"></div>
    <div className="h-64 bg-gray-200 rounded-xl"></div>
  </div>;

  const stats = data?.stats?.stats || {};
  const feed = data?.feed || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Hospital Operations</h1>
          <p className="text-muted-gray text-sm">Real-time overview of demand tickets and supply.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-success-green bg-green-50 border border-green-100 rounded-full px-3 py-1">
            <LiveDot />
            Live
            {lastUpdated && <span className="text-muted-gray font-normal">· {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          </span>
          <Link to="/hospital/demand-tickets/new">
            <Button variant="danger">
              <AlertCircle className="h-4 w-4 mr-2" />
              Raise Emergency Demand
            </Button>
          </Link>
        </div>
      </div>

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
          label="Fulfillment Rate" 
          value={`${stats.fulfillmentRate?.value ?? 0}%`} 
          trend={stats.fulfillmentRate?.trend || ''} 
        />
        <StatCard 
          label="Bank Queue (Awaiting)" 
          value={stats.pendingDonations?.value ?? 0} 
          subtext="Donation batches awaiting confirmation" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-charcoal">Demand Trend (Monthly)</h3>
              <Link to="/statistics/overview" className="text-sm text-primary-crimson hover:underline">View Analytics</Link>
            </div>
            <LineAreaChart data={trend} xKey="month" yKey="demanded" color="#B91C3C" />
          </Card>
          
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-charcoal">Recent Tickets</h3>
              <Link to="/hospital/demand-tickets" className="text-sm text-primary-crimson hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-gray">
                    <th className="pb-2 text-xs text-muted-gray uppercase">ID</th>
                    <th className="pb-2 text-xs text-muted-gray uppercase">Blood Type</th>
                    <th className="pb-2 text-xs text-muted-gray uppercase">Urgency</th>
                    <th className="pb-2 text-xs text-muted-gray uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gray">
                  {tickets.length === 0 ? (
                    <tr><td colSpan={4} className="py-6 text-center text-sm text-muted-gray">No tickets yet. Raise your first demand ticket to get started.</td></tr>
                  ) : tickets.slice(0, 6).map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="py-3 text-sm font-medium">#{ticket.id.substring(0,6)}</td>
                      <td className="py-3 text-sm">{formatType(ticket.bloodType)}</td>
                      <td className="py-3">
                        <Badge variant={ticket.urgency === 'CRITICAL' ? 'danger' : ticket.urgency === 'HIGH' ? 'warning' : 'default'}>
                          {ticket.urgency}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {ticket.status === 'PENDING' ? <span className="flex items-center text-xs text-yellow-600"><Clock className="w-3 h-3 mr-1"/> Pending</span> : 
                         ticket.status === 'CONFIRMED' ? <span className="flex items-center text-xs text-blue-600"><CheckCircle className="w-3 h-3 mr-1"/> Confirmed</span> :
                         <span className="flex items-center text-xs text-green-600"><CheckCircle className="w-3 h-3 mr-1"/> Fulfilled</span>}
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
            <h3 className="text-lg font-bold text-charcoal mb-4 border-b pb-2">Operational Feed</h3>
            <div className="space-y-4">
              {feed.length === 0 ? (
                <p className="text-sm text-muted-gray text-center py-4">No recent activity.</p>
              ) : feed.slice(0, 8).map((item, i) => (
                <div key={i} className="flex gap-3 relative">
                  {i !== Math.min(feed.length, 8) - 1 && <div className="absolute left-2.5 top-6 bottom-0 w-px bg-border-gray -z-10"></div>}
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 border-2 border-white ${
                    item.type === 'demand' ? 'bg-yellow-400' : 'bg-teal-400'
                  }`}></div>
                  <div>
                    <p className="text-sm text-charcoal font-medium">{item.title}</p>
                    {item.detail && <p className="text-xs text-muted-gray mt-0.5">{item.detail}</p>}
                    <p className="text-xs text-muted-gray mt-0.5">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Link to="/hospital/blood-availability">
            <Card className="flex flex-col justify-center items-center text-center bg-gray-50 border-dashed hover:border-primary-crimson/40 transition-colors">
              <LinkIcon className="h-6 w-6 text-primary-crimson mb-2" />
              <span className="text-primary-crimson font-medium hover:underline cursor-pointer">
                Check Regional Availability →
              </span>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}