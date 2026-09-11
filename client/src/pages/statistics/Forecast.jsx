import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { ForecastChart } from '../../components/charts/ForecastChart';
import { BrainCircuit, TrendingUp } from 'lucide-react';

export default function Forecast() {
  const { bloodType, region, timeRange } = useOutletContext();
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/stats/forecast', {
          params: { bloodType, state: region, months: timeRange.replace('M', '') }
        });
        setForecast(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch forecast');
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [bloodType, region, timeRange]);

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-white/10 rounded-xl"></div>;

  if (error || !forecast) {
    return (
      <Card>
        <p className="text-sm text-red-800 dark:text-red-300 text-center py-6">{error || 'Forecast unavailable.'}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-charcoal text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BrainCircuit className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="success">LifeFlow AI Engine</Badge>
              <span className="text-xs text-gray-400">Model v2.4 (LSTM)</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Predictive Demand Modeling</h2>
            <p className="text-gray-300 text-sm max-w-lg mb-6">
              Our machine learning model analyzes historical trends, seasonal disease outbreaks (like Dengue/Malaria), and regional demographics to forecast blood demand up to 3 months in advance.
            </p>
            <div className="flex gap-6">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Model Accuracy</div>
                <div className="text-2xl font-bold text-success-green">{forecast.accuracy}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Next Surge Prediction</div>
                <div className="text-lg font-bold">Mid-August (Monsoon)</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
             <TrendingUp className="text-primary-crimson w-6 h-6" />
             <h3 className="font-bold text-charcoal">Actionable Insights</h3>
          </div>
          <ul className="space-y-3 text-sm text-charcoal font-medium">
             <li className="flex items-start gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-primary-crimson mt-1.5 flex-shrink-0"></div>
               Prepare for a 15% spike in O- demand next month.
             </li>
             <li className="flex items-start gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-primary-crimson mt-1.5 flex-shrink-0"></div>
               Schedule drives in coastal regions ahead of monsoon.
             </li>
             <li className="flex items-start gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-primary-crimson mt-1.5 flex-shrink-0"></div>
               Current surplus of B+ allows for interstate transfers.
             </li>
          </ul>
        </Card>
      </div>

      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-charcoal">Actual vs Predicted Demand</h3>
          <p className="text-sm text-muted-gray">Historical actuals compared against model predictions.</p>
        </div>
        <ForecastChart 
          data={forecast.data} 
          xKey="month" 
          actualKey="actual" 
          predictedKey="predicted" 
        />
      </Card>
    </div>
  );
}
