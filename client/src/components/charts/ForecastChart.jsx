import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export function ForecastChart({ data, xKey, actualKey, predictedKey, height = 350 }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-muted-gray">No data available</div>;

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
          <Tooltip 
            cursor={{ fill: '#F7F6F4' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
          <Bar dataKey={actualKey} name="Actual Data" fill="#B91C3C" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Line 
            type="monotone" 
            dataKey={predictedKey} 
            name="AI Prediction" 
            stroke="#0EA5A0" 
            strokeWidth={3} 
            strokeDasharray="5 5" 
            dot={{ r: 4, fill: '#0EA5A0', strokeWidth: 0 }} 
            activeDot={{ r: 6 }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
