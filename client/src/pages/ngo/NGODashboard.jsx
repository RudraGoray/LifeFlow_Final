import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import usePolling from '../../hooks/usePolling';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/dashboard/PageHeader';
import { PlusCircle, MapPin, Droplet, Clock, CheckCircle, UserPlus, BarChart3, CalendarDays } from 'lucide-react';

const formatType = (type) => (type || '').replace('_POS', '+').replace('_NEG', '-');

import usePageTitle from '../../hooks/usePageTitle';

export default function NGODashboard() {
  usePageTitle('NGO Dashboard');
  const { user } = useAuth();
  const [camps, setCamps] = useState([]);

  const { data, loading, lastUpdated } = usePolling(() => api.get('/dashboard/ngo').then(r => r.data), 30000, [user.orgId]);

  useEffect(() => {
    api.get('/camps/upcoming')
      .then((r) => setCamps(Array.isArray(r.data) ? r.data : []))
      .catch((err) => console.error('Failed to fetch upcoming camps', err));
  }, []);

  if (loading && !data) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-white/10 rounded-xl"></div>;

  const stats = data?.stats || {};
  const recentBatches = data?.recentBatches || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="NGO Operations"
        subtitle="Manage donation drives, donors and dispatch blood units to banks."
        lastUpdated={lastUpdated}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/ngo/donors/new">
              <Button variant="secondary">
                <UserPlus className="h-4 w-4 mr-2" />
                Register Donor
              </Button>
            </Link>
            <Link to="/ngo/donation-batches/new">
              <Button variant="primary">
                <PlusCircle className="h-4 w-4 mr-2" />
                Submit Donation Batch
              </Button>
            </Link>
          </div>
        }
      />

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
          label="Donors Registered"
          value={stats.donorsRegistered?.value ?? 0}
          trend="In your region"
        />
        <StatCard
          label="Pending Batches"
          value={stats.pendingBatches?.value ?? 0}
          trend={stats.pendingBatches?.value > 0 ? 'Awaiting bank approval' : 'All clear'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-charcoal dark:text-white">Recent Donation Batches</h3>
            <Link to="/ngo/donation-batches" className="text-sm text-primary-crimson dark:text-crimson-400 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentBatches.length === 0 ? (
              <p className="text-sm text-muted-gray dark:text-gray-400 text-center py-4">No recent batches submitted.</p>
            ) : recentBatches.map(batch => (
              <div key={batch.id} className="flex flex-col sm:flex-row sm:justify-between gap-3 p-4 border border-border-gray dark:border-white/10 rounded-lg hover:border-primary-crimson/30 transition-colors">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal dark:text-white text-sm">{batch.campName}</span>
                    <Badge variant={batch.status === 'PENDING' ? 'warning' : 'success'}>{batch.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-gray dark:text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center"><Droplet className="h-3 w-3 mr-1" /> {batch.units} Units ({formatType(batch.bloodType)})</span>
                    {batch.receivingBank && <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {batch.receivingBank}</span>}
                  </div>
                </div>
                <div className="text-xs text-muted-gray dark:text-gray-400 text-left sm:text-right">
                  <div>{new Date(batch.submittedAt).toLocaleDateString()}</div>
                  {batch.status === 'PENDING' ? (
                    <div className="text-yellow-600 dark:text-amber-400 flex items-center sm:justify-end mt-1"><Clock className="h-3 w-3 mr-1" /> Awaiting Bank</div>
                  ) : (
                    <div className="text-green-600 dark:text-emerald-400 flex items-center sm:justify-end mt-1"><CheckCircle className="h-3 w-3 mr-1" /> Confirmed</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-charcoal dark:text-white flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-crimson" /> Upcoming Camps
              </h3>
              <Link to="/find-camps" className="text-sm text-primary-crimson dark:text-crimson-400 hover:underline">View All</Link>
            </div>
            {camps.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border-gray dark:border-white/10 rounded-lg">
                <p className="text-muted-gray dark:text-gray-400 text-sm">No upcoming camps scheduled.</p>
                <Link to="/camp-registration">
                  <Button variant="ghost" className="mt-3 border border-border-gray dark:border-white/10">Schedule New Camp</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {camps.slice(0, 4).map((camp) => (
                  <div key={camp.id} className="flex items-center justify-between gap-3 p-3 border border-border-gray dark:border-white/10 rounded-lg">
                    <div>
                      <div className="text-sm font-bold text-charcoal dark:text-white">{camp.name}</div>
                      <div className="text-xs text-muted-gray dark:text-gray-400">
                        {new Date(camp.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {camp.cityDistrict}
                      </div>
                    </div>
                    <Badge variant="info">{camp.tagType || 'General'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Link to="/ngo/analytics">
            <Card className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 border-dashed hover:border-primary-crimson/40 transition-colors">
              <BarChart3 className="h-8 w-8 text-primary-crimson dark:text-crimson-400 flex-shrink-0" />
              <div>
                <div className="text-primary-crimson dark:text-crimson-400 font-semibold hover:underline cursor-pointer">
                  View Impact Analytics →
                </div>
                <p className="text-xs text-muted-gray dark:text-gray-400 mt-0.5">Collections, donors and camp impact over time.</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
