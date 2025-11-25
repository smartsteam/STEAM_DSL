import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DataPoint } from '../types';
import { formatElapsedTime } from '../utils';

interface RealTimeChartProps {
  data: DataPoint[];
  dataKeys: string[];
  sensorNames?: Record<string, string>;
  windowSize: number;
  yAxisDomain: [number | 'auto', number | 'auto'];
  emptyMessage?: string;
  xAxisKey: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#6366f1', '#14b8a6'];

export const RealTimeChart: React.FC<RealTimeChartProps> = ({ 
  data, 
  dataKeys,
  sensorNames = {},
  windowSize,
  yAxisDomain,
  emptyMessage = "Waiting for data stream...",
  xAxisKey
}) => {
  if (dataKeys.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Optimize rendering by taking last N points based on windowSize
  const displayData = data.slice(-windowSize);

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={displayData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="#94a3b8" 
            tick={{fontSize: 11}}
            interval="preserveStartEnd"
            minTickGap={50}
            tickFormatter={(val) => {
              if (typeof val === 'number') {
                // If using timestamp (relative), format as HH:MM:SS
                // We truncate milliseconds for the axis to save space, but keep seconds
                return formatElapsedTime(val).split('.')[0]; 
              }
              return val;
            }}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{fontSize: 12}}
            domain={yAxisDomain}
            allowDataOverflow={true} // Allow scaling/clipping if manual range is tighter than data
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
            itemStyle={{ color: '#e2e8f0' }}
            formatter={(value: number, name: string) => [value, sensorNames[name] || name]}
            labelStyle={{ color: '#94a3b8' }}
            labelFormatter={(label) => typeof label === 'number' ? formatElapsedTime(label) : label}
          />
          <Legend formatter={(value) => sensorNames[value] || value} />
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              name={key} // Used for matching in formatter
              type="monotone"
              dataKey={key}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              isAnimationActive={false} // Disable animation for better performance on high updates
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
