import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { ForecastChart } from '../../components/charts/ForecastChart';
import { BrainCircuit, TrendingUp, CalendarClock } from 'lucide-react';

const OUTLOOK_VIEWS = [
  { key: 'both', label: 'Both overlaid' },
  { key: 'demand', label: 'Demand' },
  { key: 'donated', label: 'Donated' },
];

function FutureOutlookChart({ data, view, height = 350 }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-gray">No outlook data available</div>;
  }
  const showDemand = view === 'both' || view === 'demand';
  const showDonated = view === 'both' || view === 'donated';
  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
          {showDemand && (
            <Line
              type="monotone" dataKey="predictedDemand" name="Predicted demand"
              stroke="#B91C3C" strokeWidth={3} strokeDasharray="6 4"
              dot={{ r: 3, fill: '#B91C3C', strokeWidth: 0 }} activeDot={{ r: 6 }}
            />
          )}
          {showDonated && (
            <Line
              type="monotone" dataKey="predictedDonated" name="Predicted donated"
              stroke="#0EA5A0" strokeWidth={3} strokeDasharray="6 4"
              dot={{ r: 3, fill: '#0EA5A0', strokeWidth: 0 }} activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

import usePageTitle from '../../hooks/usePageTitle';

export default function Forecast() {
  usePageTitle('AI Forecast');
  const { bloodType, region, timeRange } = useOutletContext();
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [outlook, setOutlook] = useState([]);
  const [outlookLoading, setOutlookLoading] = useState(true);
  const [outlookError, setOutlookError] = useState(null);
  const [outlookView, setOutlookView] = useState('both');

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

  useEffect(() => {
    const fetchOutlook = async () => {
      setOutlookLoading(true);
      setOutlookError(null);
      try {
        const response = await api.get('/stats/forecast/future', {
          params: { bloodType, state: region, months: 12 }
        });
        setOutlook(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (err) {
        setOutlookError(err.response?.data?.error || 'Failed to fetch 12-month outlook');
      } finally {
        setOutlookLoading(false);
      }
    };
    fetchOutlook();
  }, [bloodType, region]);

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
                <div className="text-2xl font-bold text-success-green">{forecast.accuracy ?? '—'}%</div>
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

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary-crimson" />
              Next 12 Months Outlook
            </h3>
            <p className="text-sm text-muted-gray">Pure model prediction — no actuals to compare against yet.</p>
          </div>
          <div className="flex p-1 bg-gray-100 dark:bg-white/10 rounded-lg w-fit">
            {OUTLOOK_VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setOutlookView(v.key)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  outlookView === v.key
                    ? 'bg-white dark:bg-white/10 shadow-sm text-charcoal dark:text-white'
                    : 'text-muted-gray dark:text-gray-400 hover:text-charcoal dark:hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
        {outlookLoading ? (
          <div className="animate-pulse h-[350px] bg-gray-100 dark:bg-white/5 rounded-xl" />
        ) : outlookError ? (
          <p className="text-sm text-red-800 dark:text-red-300 text-center py-6">{outlookError}</p>
        ) : (
          <FutureOutlookChart data={outlook} view={outlookView} />
        )}
      </Card>
    </div>
  );
}
