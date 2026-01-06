import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/shared/ui';
import { WeeklyVolume } from '../api/progress.api';

interface VolumeChartProps {
  data: WeeklyVolume[];
}

export const VolumeChart: React.FC<VolumeChartProps> = ({ data }) => {
  // Format dates for display
  const formattedData = data.map((d) => ({
    ...d,
    date: new Date(d.weekStart).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <Card className="h-96 w-full p-4">
      <h3 className="text-lg font-semibold mb-4">Volume e Intensità</h3>
      <div className="h-full w-full pb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Intensità (kg/rep)', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="volume"
              name="Volume"
              stroke="#2563eb"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgIntensity"
              name="Intensità Media"
              stroke="#16a34a"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

