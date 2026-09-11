import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/ui/Card';

import usePageTitle from '../../hooks/usePageTitle';

export default function GapAnalysis() {
  usePageTitle('Gap Analysis');
  const { bloodType, region, timeRange } = useOutletContext();
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGaps = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/stats/gap', {
          params: { bloodType, state: region, months: timeRange.replace('M', '') }
        });
        setGaps(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch gap analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchGaps();
  }, [bloodType, region, timeRange]);

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-white/10 rounded-xl"></div>;

  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-800 dark:text-red-300 text-center py-6">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-charcoal">Blood Type Deficit & Surplus</h2>
        <p className="text-sm text-muted-gray">Identify which blood types require immediate attention and targeted donation drives.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gaps.map((item, idx) => (
          <Card key={idx} className={`border-t-4 ${
            item.status === 'Severe Deficit' ? 'border-t-danger-red bg-red-50/50' : 
            item.status === 'Mild Deficit' ? 'border-t-warning-amber bg-yellow-50/50' : 
            item.status.includes('Surplus') ? 'border-t-info-blue bg-blue-50/50' : 
            'border-t-success-green bg-green-50/50'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div className="text-2xl font-bold text-charcoal">{item.bloodType}</div>
              <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                item.percentage < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {item.percentage > 0 ? '+' : ''}{item.percentage}%
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-charcoal">{item.status}</div>
              <div className="text-xs text-muted-gray">
                Net: {item.surplus > 0 ? '+' : ''}{item.surplus} units
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-black/5">
              {item.isDeficit ? (
                <div className="text-xs font-bold text-primary-crimson uppercase tracking-wider cursor-pointer hover:underline">
                  Target Drives →
                </div>
              ) : (
                <div className="text-xs font-bold text-info-blue uppercase tracking-wider cursor-pointer hover:underline">
                  Initiate Transfers →
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
