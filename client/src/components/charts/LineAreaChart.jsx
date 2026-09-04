import React from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export function LineAreaChart({ data, xKey, yKey, type = 'area', color = '#B91C3C', height = 300 }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-muted-gray">No data available</div>;

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
              itemStyle={{ color: '#2B2B2E', fontWeight: 600 }}
            />
            <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} fillOpacity={1} fill="url(#colorGradient)" activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
              itemStyle={{ color: '#2B2B2E', fontWeight: 600 }}
            />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} dot={false} activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
