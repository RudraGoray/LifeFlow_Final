import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import usePolling from '../../hooks/usePolling';
import StatCard from '../../components/ui/StatCard';
import LiveDot from '../../components/ui/LiveDot';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { PlusCircle, MapPin, Droplet, Clock, CheckCircle } from 'lucide-react';

const formatType = (type) => type.replace('_POS', '+').replace('_NEG', '-');

export default function NGODashboard() {
  const { user } = useAuth();
  const { data, loading, lastUpdated } = usePolling(() => api.get('/dashboard/ngo').then(r => r.data), 30000, [user.orgId]);

  if (loading && !data) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl"></div>;

  const stats = data?.stats || {};
  const recentBatches = data?.recentBatches || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">NGO Operations</h1>
          <p className="text-muted-gray text-sm">Manage donation drives and dispatch blood units to banks.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-success-green bg-green-50 border border-green-100 rounded-full px-3 py-1">
            <LiveDot />
            Live
            {lastUpdated && <span className="text-muted-gray font-normal">· {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          </span>
          <Link to="/ngo/donation-batches/new">
            <Button variant="primary">
              <PlusCircle className="h-4 w-4 mr-2" />
              Submit Donation Batch
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Camps This Month" 
          value={stats.campsThisMonth?.value ?? 0} 
          trend={stats.campsThisMonth?.value > 0 ? 'Active' : 'No camps yet'} 
          isLive={stats.campsThisMonth?.value > 0} 
        />
        <StatCard 
          label="Units Collected" 
          value={stats.totalCollected?.value ?? 0} 
          trend="Confirmed supply" 
        />
        <StatCard 
          label="Pending Batches" 
          value={stats.pendingBatches?.value ?? 0} 
          trend={stats.pendingBatches?.value > 0 ? 'Awaiting bank approval' : 'All clear'} 
        />
        <StatCard 
          label="Active Volunteers" 
          value={stats.activeVolunteers?.value ?? 0} 
          trend="This quarter" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-charcoal">Recent Donation Batches</h3>
            <Link to="/ngo/donation-batches" className="text-sm text-primary-crimson hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentBatches.length === 0 ? (
              <p className="text-sm text-muted-gray text-center py-4">No recent batches submitted.</p>
            ) : recentBatches.map(batch => (
              <div key={batch.id} className="flex flex-col sm:flex-row sm:justify-between gap-3 p-4 border border-border-gray rounded-lg hover:border-primary-crimson/30 transition-colors">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal text-sm">{batch.campName}</span>
                    <Badge variant={batch.status === 'PENDING' ? 'warning' : 'success'}>{batch.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-gray flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center"><Droplet className="h-3 w-3 mr-1"/> {batch.units} Units ({formatType(batch.bloodType)})</span>
                    {batch.receivingBank && <span className="flex items-center"><MapPin className="h-3 w-3 mr-1"/> {batch.receivingBank}</span>}
                  </div>
                </div>
                <div className="text-xs text-muted-gray text-left sm:text-right">
                  <div>{new Date(batch.submittedAt).toLocaleDateString()}</div>
                  {batch.status === 'PENDING' ? (
                    <div className="text-yellow-600 flex items-center sm:justify-end mt-1"><Clock className="h-3 w-3 mr-1"/> Awaiting Bank</div>
                  ) : (
                    <div className="text-green-600 flex items-center sm:justify-end mt-1"><CheckCircle className="h-3 w-3 mr-1"/> Confirmed</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
           <h3 className="text-lg font-bold text-charcoal mb-4">Upcoming Camps (Your NGO)</h3>
           <div className="text-center py-12 border-2 border-dashed border-border-gray rounded-lg">
             <p className="text-muted-gray">No upcoming camps scheduled.</p>
             <Button variant="ghost" className="mt-4 border border-border-gray">Schedule New Camp</Button>
           </div>
        </Card>
      </div>
    </div>
  );
}