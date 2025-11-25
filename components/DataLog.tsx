import React, { useEffect, useRef } from 'react';
import { DataPoint, TimeMode } from '../types';
import { Pencil } from 'lucide-react';
import { formatElapsedTime } from '../utils';

interface DataLogProps {
  data: DataPoint[];
  dataKeys: string[];
  sensorNames?: Record<string, string>;
  onNameChange?: (key: string, newName: string) => void;
  translations?: {
    time: string;
    value: string;
    noData: string;
  }
  timeMode: TimeMode;
}

export const DataLog: React.FC<DataLogProps> = ({ 
  data, 
  dataKeys, 
  sensorNames = {}, 
  onNameChange,
  translations = { time: "Time", value: "Value", noData: "No data recorded" },
  timeMode
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new data arrives
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data]);

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden">
      {/* Increased first column width from 100px to 120px to fit HH:MM:SS.mmm */}
      <div className="grid grid-cols-[120px_1fr] bg-slate-800 p-2 text-xs font-semibold text-slate-300 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-700">
        <div className="flex items-center">{translations.time}</div>
        <div className="flex gap-4">
          {dataKeys.length > 0 ? dataKeys.map(k => (
            <div key={k} className="flex-1 flex items-center justify-end group relative">
                <input 
                  type="text"
                  value={sensorNames[k] || k}
                  onChange={(e) => onNameChange && onNameChange(k, e.target.value)}
                  className="bg-transparent text-right w-full focus:outline-none border-b border-transparent focus:border-blue-500 text-blue-200 placeholder-slate-500 transition-all"
                  placeholder={k}
                />
                <Pencil className="w-3 h-3 text-slate-500 ml-1 opacity-0 group-hover:opacity-50 absolute right-0 -top-1 pointer-events-none" />
            </div>
          )) : <span>{translations.value}</span>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {data.length === 0 ? (
          <div className="text-center text-slate-600 py-4 italic text-sm">{translations.noData}</div>
        ) : (
          data.map((point, idx) => (
            <div key={idx} className="grid grid-cols-[120px_1fr] border-b border-slate-800/50 py-1.5 hover:bg-slate-800/30 transition-colors text-sm font-mono">
              <div className="text-slate-500 text-xs flex items-center">
                {timeMode === 'relative' 
                  ? formatElapsedTime(point.timestamp)
                  : point.formattedTime}
              </div>
              <div className="flex gap-4">
                 {dataKeys.map(k => (
                   <span key={k} className="flex-1 text-right text-slate-200">
                     {typeof point[k] === 'number' ? (point[k] as number).toFixed(2) : point[k]}
                   </span>
                 ))}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
