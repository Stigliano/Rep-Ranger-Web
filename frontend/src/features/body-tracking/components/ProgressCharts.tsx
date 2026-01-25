import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BodyMetric } from '../types';

interface ProgressChartsProps {
  metrics: BodyMetric[];
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ metrics }) => {
  // Filter and process data for charts
  const weightData = metrics
    .filter(m => m.metricType === 'weight')
    .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
    .map(m => ({
      date: new Date(m.measuredAt).toLocaleDateString(),
      value: m.value,
    }));

  // Assuming bodyFat is stored as a metric or derived. If it's not in metrics history directly,
  // we might need to pass session data or composition history. 
  // For now, let's visualize weight and maybe waist as a proxy for fat loss if BF% isn't tracked directly yet.
  const waistData = metrics
    .filter(m => m.metricType === 'waist')
    .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
    .map(m => ({
      date: new Date(m.measuredAt).toLocaleDateString(),
      value: m.value,
    }));

  if (weightData.length === 0 && waistData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-200 text-gray-400">
        Nessun dato disponibile per i grafici
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Weight Chart */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Andamento Peso</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 10, fill: '#9ca3af'}} 
                axisLine={false} 
                tickLine={false}
                minTickGap={30}
              />
              <YAxis 
                domain={['dataMin - 1', 'dataMax + 1']} 
                tick={{fontSize: 10, fill: '#9ca3af'}} 
                axisLine={false} 
                tickLine={false}
                width={30}
              />
              <Tooltip 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                itemStyle={{fontSize: '12px', fontWeight: 600}}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#000000" 
                strokeWidth={2} 
                dot={{r: 3, fill: '#000000'}} 
                activeDot={{r: 5}} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Waist Chart */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Circonferenza Vita</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={waistData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 10, fill: '#9ca3af'}} 
                axisLine={false} 
                tickLine={false}
                minTickGap={30}
              />
              <YAxis 
                domain={['dataMin - 1', 'dataMax + 1']} 
                tick={{fontSize: 10, fill: '#9ca3af'}} 
                axisLine={false} 
                tickLine={false}
                width={30}
              />
              <Tooltip 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                itemStyle={{fontSize: '12px', fontWeight: 600, color: '#2563eb'}}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                strokeWidth={2} 
                dot={{r: 3, fill: '#2563eb'}} 
                activeDot={{r: 5}} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
