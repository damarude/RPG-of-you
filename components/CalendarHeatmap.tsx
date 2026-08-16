
import React from 'react';
import { LearningSession } from '../types';

interface CalendarHeatmapProps {
  sessions: LearningSession[];
  daysToShow?: number;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ sessions, daysToShow = 28 }) => {
  const today = new Date();
  // Normalize today to midnight
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const getIntensityClass = (date: Date) => {
    const dateStr = date.toDateString();
    const daySessions = sessions.filter(s => new Date(s.timestamp).toDateString() === dateStr);
    const totalMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    if (totalMinutes === 0) return 'bg-slate-800 border-slate-700';
    if (totalMinutes < 15) return 'bg-emerald-900/40 border-emerald-800'; // Light
    if (totalMinutes < 45) return 'bg-emerald-600 border-emerald-500'; // Medium
    return 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_#34d399]'; // High
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-2 uppercase font-bold">
        <span>History</span>
        <span>Last {daysToShow} Days</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((date, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div 
              className={`w-full aspect-square rounded-md border ${getIntensityClass(date)} transition-all duration-300`}
              title={`${date.toDateString()}`}
            ></div>
            {idx >= daysToShow - 7 && (
              <span className="text-[10px] text-slate-600 mt-1 font-mono">
                {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
