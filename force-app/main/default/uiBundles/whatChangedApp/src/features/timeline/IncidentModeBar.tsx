import React, { useState } from 'react';
import { Flame, Clock, X } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface IncidentModeBarProps {
  incidentTime?: string;
  incidentWindowMinutes?: number;
  onApply: (time: string, windowMinutes: number) => void;
  onClose: () => void;
}

export const IncidentModeBar: React.FC<IncidentModeBarProps> = ({
  incidentTime,
  incidentWindowMinutes = 30,
  onApply,
  onClose,
}) => {
  const [selectedTime, setSelectedTime] = useState(() => {
    if (incidentTime) {
      const d = new Date(incidentTime);
      return d.toTimeString().slice(0, 5); // "HH:MM"
    }
    return '15:00'; // Default 3:00 PM
  });

  const [selectedWindow, setSelectedWindow] = useState(incidentWindowMinutes);

  const handleUpdate = () => {
    const today = new Date();
    const [hours, minutes] = selectedTime.split(':').map(Number);
    today.setHours(hours, minutes, 0, 0);
    onApply(today.toISOString(), selectedWindow);
  };

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 border border-amber-300 dark:border-amber-700/50 mb-6 shadow-sm animate-in slide-in-from-top-2 duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-rose-500/30">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Incident Mode Active
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold">
                Time Investigation
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Investigating all Salesforce platform modifications within a specific incident window.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-surface border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-600 dark:text-slate-400">Target Time:</span>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs bg-surface border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 shadow-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">Window:</span>
            <select
              value={selectedWindow}
              onChange={(e) => setSelectedWindow(Number(e.target.value))}
              className="bg-transparent text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
            >
              <option value={15}>± 15 minutes</option>
              <option value={30}>± 30 minutes</option>
              <option value={60}>± 60 minutes</option>
            </select>
          </div>

          <Button size="sm" variant="primary" onClick={handleUpdate}>
            Apply Window
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            title="Exit Incident Mode"
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
