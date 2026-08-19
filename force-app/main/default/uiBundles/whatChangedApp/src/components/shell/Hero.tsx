import React, { useState, useEffect } from 'react';
import { RotateCw, Calendar } from 'lucide-react';
import { DateRangeOption } from '../../domain/types';
import { Button } from '../common/Button';

interface HeroProps {
  title?: string;
  subtitle?: string;
  lastRefreshedAt?: string;
  secondsAgo: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  range?: DateRangeOption;
  customFrom?: string;
  customTo?: string;
  onRangeChange?: (range: DateRangeOption) => void;
  onCustomDatesChange?: (from?: string, to?: string) => void;
  isLoading?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle = 'A live view of configuration, automation, access and platform changes across your Salesforce org.',
  secondsAgo,
  isRefreshing,
  onRefresh,
  range = 'today',
  customFrom = '',
  customTo = '',
  onRangeChange,
  onCustomDatesChange,
  isLoading = false,
}) => {
  const [localFrom, setLocalFrom] = useState(customFrom);
  const [localTo, setLocalTo] = useState(customTo);

  useEffect(() => {
    setLocalFrom(customFrom);
    setLocalTo(customTo);
  }, [customFrom, customTo]);

  const dateRanges: { id: DateRangeOption; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '24h', label: 'Last 24h' },
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
    { id: 'custom', label: 'Custom' },
  ];

  const handleCustomApply = () => {
    if (onCustomDatesChange) {
      onCustomDatesChange(localFrom || undefined, localTo || undefined);
    }
  };

  const getDynamicTitle = () => {
    if (title) return title;
    switch (range) {
      case 'today':
        return 'What changed today?';
      case '24h':
        return 'What changed in the last 24 hours?';
      case '7d':
        return 'What changed in the last 7 days?';
      case '30d':
        return 'What changed in the last 30 days?';
      case 'custom':
        if (customFrom || customTo) {
          return `What changed between ${customFrom || 'Start'} → ${customTo || 'Now'}?`;
        }
        return 'What changed in custom period?';
      default:
        return 'What changed today?';
    }
  };

  return (
    <div className="py-6 border-b border-slate-200/80 dark:border-slate-800/80 mb-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{getDynamicTitle()}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date range segmented button control */}
          {onRangeChange && (
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-surface p-0.5 shadow-xs">
              {dateRanges.map((r) => {
                const active = range === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => onRangeChange(r.id)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      active
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          )}

          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums hidden sm:inline">
            {secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing || isLoading}
            className="flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Custom Date Range Picker Bar */}
      {range === 'custom' && onCustomDatesChange && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center gap-3 text-xs animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <Calendar className="w-4 h-4 text-sky-500" />
            <span>Custom Date Range:</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">From</span>
            <input
              type="date"
              value={localFrom}
              onChange={(e) => setLocalFrom(e.target.value)}
              className="bg-surface border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">To</span>
            <input
              type="date"
              value={localTo}
              onChange={(e) => setLocalTo(e.target.value)}
              className="bg-surface border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {(localFrom || localTo) && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="primary" onClick={handleCustomApply} isLoading={isLoading}>
                Apply
              </Button>
              <button
                onClick={() => {
                  setLocalFrom('');
                  setLocalTo('');
                  onCustomDatesChange(undefined, undefined);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs underline"
              >
                Reset dates
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
