import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export function DualBarChart({ data, xKey, bar1Key, bar2Key, bar1Name, bar2Name, height = 350 }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-muted-gray">No data available</div>;

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 5 }} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
          <Tooltip 
            cursor={{ fill: '#F7F6F4' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
          <Bar dataKey={bar1Key} name={bar1Name} fill="#B91C3C" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey={bar2Key} name={bar2Name} fill="#2B2B2E" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
