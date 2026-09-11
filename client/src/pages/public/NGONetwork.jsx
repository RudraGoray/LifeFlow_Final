import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Heart, Globe, Shield } from 'lucide-react';

import usePageTitle from '../../hooks/usePageTitle';

export default function NGONetwork() {
  usePageTitle('NGO Network');
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const response = await api.get('/organizations', { params: { type: 'NGO' } });
        setNgos(Array.isArray(response.data?.organizations) ? response.data.organizations : []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch partner network');
      } finally {
        setLoading(false);
      }
    };
    fetchNgos();
  }, []);

  const statesCovered = new Set(ngos.map((n) => n.state).filter(Boolean)).size;

  const tierBadge = (tier) => {
    if (!tier) return <Badge variant="default">Partner</Badge>;
    if (tier.includes('Platinum')) return <Badge variant="success">{tier}</Badge>;
    if (tier.includes('Gold')) return <Badge variant="warning">{tier}</Badge>;
    return <Badge variant="default">{tier}</Badge>;
  };

  return (
    <div className="min-h-screen bg-off-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-charcoal mb-4">Our NGO Partner Network</h1>
          <p className="text-lg text-muted-gray max-w-3xl mx-auto">
            LifeFlow operates in collaboration with verified non-profit organizations across the country.
            Together, we form a decentralized but highly coordinated web of life-saving supply lines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center border-t-4 border-t-primary-crimson">
            <Heart className="h-10 w-10 text-primary-crimson mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{loading ? '…' : `${ngos.length} Active NGOs`}</h3>
            <p className="text-muted-gray text-sm">Working seamlessly on our platform to coordinate camps and dispatch units.</p>
          </Card>
          <Card className="text-center border-t-4 border-t-success-green">
            <Globe className="h-10 w-10 text-success-green mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{loading ? '…' : `${statesCovered} States Covered`}</h3>
            <p className="text-muted-gray text-sm">Our partners operate across critical districts countrywide.</p>
          </Card>
          <Card className="text-center border-t-4 border-t-info-blue">
            <Shield className="h-10 w-10 text-info-blue mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Verified Partners</h3>
            <p className="text-muted-gray text-sm">Every NGO on LifeFlow undergoes a strict compliance and cold-chain audit.</p>
          </Card>
        </div>

        <h2 className="text-2xl font-bold text-charcoal mb-6">Featured Partners</h2>
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 text-sm rounded-lg text-center">{error}</div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse h-32 bg-gray-100" />)}
          </div>
        ) : ngos.length === 0 && !error ? (
          <p className="text-center text-muted-gray py-8">No partner organizations listed yet.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-border-gray overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-border-gray">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-gray uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-gray uppercase tracking-wider">Region</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-gray uppercase tracking-wider">Focus Area</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-gray uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray">
                {ngos.map((ngo) => (
                  <tr key={ngo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-charcoal">{ngo.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-gray">{ngo.cityDistrict}, {ngo.state}</td>
                    <td className="px-6 py-4 text-sm text-muted-gray">{ngo.focus || 'General Support'}</td>
                    <td className="px-6 py-4">{tierBadge(ngo.tier)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
