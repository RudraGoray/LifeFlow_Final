import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import { DualBarChart } from '../../components/charts/DualBarChart';
import { Activity } from 'lucide-react';

export default function Overview() {
  const { bloodType, region, timeRange } = useOutletContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setError(null);
      try {
        const response = await api.get('/stats/monthly', {
          params: { bloodType, state: region, months: timeRange.replace('M', '') }
        });
        setData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch monthly stats');
      } finally {
        setLoading(false);
      }
    };
    fetchMonthlyData();
  }, [bloodType, region, timeRange]);

  const totalDonated = data.reduce((sum, item) => sum + item.donated, 0);
  const totalDemanded = data.reduce((sum, item) => sum + item.demanded, 0);
  const netStatus = totalDonated - totalDemanded;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Collected" 
          value={totalDonated.toLocaleString()} 
          trend="Aggregated units" 
        />
        <StatCard 
          label="Total Demanded" 
          value={totalDemanded.toLocaleString()} 
          trend="Aggregated units" 
        />
        <Card className={`flex flex-col justify-center items-center ${netStatus >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="text-sm font-bold uppercase tracking-wider text-muted-gray mb-2">Net Status</div>
          <div className={`text-4xl font-extrabold ${netStatus >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {netStatus > 0 ? '+' : ''}{netStatus.toLocaleString()}
          </div>
          <div className={`text-sm mt-1 font-medium ${netStatus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netStatus >= 0 ? 'Overall Surplus' : 'Overall Deficit'}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-charcoal">Supply vs Demand (Monthly Trend)</h3>
          <div className="flex items-center text-xs font-medium text-muted-gray bg-gray-100 px-3 py-1 rounded-full">
             <Activity className="w-3 h-3 mr-1 text-info-blue" />
             Data includes global filter context
          </div>
        </div>
        <DualBarChart 
          data={data} 
          xKey="month" 
          bar1Key="donated" 
          bar1Name="Donated Units" 
          bar2Key="demanded" 
          bar2Name="Demanded Units" 
        />
      </Card>
    </div>
  );
}
