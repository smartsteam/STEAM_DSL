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

const COLORS = ['#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed', '#4f46e5', '#0d9488'];

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
      <div className="flex h-full items-center justify-center text-stone-400">
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
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="#6b7280" 
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
            stroke="#6b7280" 
            tick={{fontSize: 12}}
            domain={yAxisDomain}
            allowDataOverflow={true} // Allow scaling/clipping if manual range is tighter than data
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#1f2937', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#374151' }}
            formatter={(value: number, name: string) => [value, sensorNames[name] || name]}
            labelStyle={{ color: '#6b7280' }}
            labelFormatter={(label) => typeof label === 'number' ? formatElapsedTime(label) : label}
          />
          <Legend formatter={(value) => sensorNames[value] || value} wrapperStyle={{ color: '#374151' }} />
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