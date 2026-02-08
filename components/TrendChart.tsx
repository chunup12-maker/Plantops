import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PlantEntry } from '../types';

interface TrendChartProps {
  entries: PlantEntry[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ entries }) => {
  const data = entries.map(e => ({
    date: new Date(e.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: e.healthScore,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (data.length === 0) return (
    <div className="h-48 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-lg">
      No data points yet.
    </div>
  );

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#10b981" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};