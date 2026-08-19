import React, { useState } from 'react';
import { BarChart2, Calendar, Clock, Layers, ShieldCheck, RotateCw } from 'lucide-react';
import { Insights } from '../../domain/types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { ErrorBanner } from '../../components/common/ErrorBanner';

interface InsightsViewProps {
  insights: Insights | null;
  isLoading: boolean;
  error: Error | null;
  onRefresh: (range: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  insights,
  isLoading,
  error,
  onRefresh,
}) => {
  const [range, setRange] = useState('7d');

  if (error && !insights) {
    const isForbidden = (error as any).code === 'FORBIDDEN' || (error as any).statusCode === 403;
    return <ErrorState isForbidden={isForbidden} message={error.message} onRetry={() => onRefresh(range)} />;
  }

  if (!insights) return null;

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    onRefresh(newRange);
  };

  const maxDayCount = Math.max(...insights.dailyTrends.map((d) => d.count), 5);
  const maxHourCount = Math.max(...insights.hourlyTrends.map((h) => h.count), 5);
  const maxSectionCount = Math.max(...insights.topSections.map((s) => s.count), 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {error && <ErrorBanner message={error.message} onRetry={() => onRefresh(range)} />}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>Change Insights &amp; Trends</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Longitudinal observability across setup activity, operational peaks, and risk vectors
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-surface p-0.5 shadow-sm text-xs">
            <button
              onClick={() => handleRangeChange('7d')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                range === '7d'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleRangeChange('30d')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                range === '30d'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Last 30 Days
            </button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onRefresh(range)}
            isLoading={isLoading}
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid of 4-6 meaningful charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Daily Trend Volume */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Daily Change Volume</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total setup events per day in the evaluated period
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
              {insights.totalEvaluatedPeriodChanges} total
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
            {insights.dailyTrends.map((d) => {
              const hPct = Math.max((d.count / maxDayCount) * 100, d.count > 0 ? 10 : 3);
              return (
                <div key={d.dateLabel} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {d.count}
                  </span>
                  <div
                    style={{ height: `${hPct}%` }}
                    className="w-full max-w-[32px] bg-sky-600 dark:bg-sky-500 rounded-t-md hover:bg-sky-500 transition-all shadow-xs"
                  />
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2">
                    {d.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 2. Busiest Hours of Day */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Peak Activity Hours</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Aggregated activity times showing deployment and admin patterns
              </p>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-1.5 pt-4 px-1">
            {insights.hourlyTrends.map((h) => {
              const hPct = Math.max((h.count / maxHourCount) * 100, h.count > 0 ? 10 : 3);
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div
                    style={{ height: `${hPct}%` }}
                    className="w-full max-w-[20px] bg-purple-600 dark:bg-purple-500 rounded-t-md hover:bg-purple-500 transition-all shadow-xs"
                    title={`${h.hourLabel}: ${h.count} changes`}
                  />
                  <span className="text-[9px] text-slate-400 mt-2">
                    {h.hour % 3 === 0 ? h.hourLabel.replace(' ', '') : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 3. Top Salesforce Sections */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Most Modified Salesforce Sections</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked Setup Audit Trail section categories
            </p>
          </div>

          <div className="space-y-3">
            {insights.topSections.map((sec) => {
              const pct = ((sec.count / maxSectionCount) * 100).toFixed(0);
              return (
                <div key={sec.section} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-slate-200">{sec.section}</span>
                    <span className="text-slate-500 tabular-nums font-semibold">{sec.count} changes</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-teal-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 4. Severity & Risk Profile */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>Severity &amp; Risk Breakdown</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              WhatChanged heuristic classification distribution
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-slate-400 block mb-1">INFO</span>
              <span className="text-2xl font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                {insights.severityDistribution['INFO'] || 0}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Labels, descriptions, docs</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-emerald-50/40 dark:bg-emerald-950/20">
              <span className="text-emerald-600 dark:text-emerald-400 block mb-1">LOW</span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                {insights.severityDistribution['LOW'] || 0}
              </span>
              <p className="text-[10px] text-emerald-600/70 mt-1">Page layouts, UI tweaks</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-amber-50/40 dark:bg-amber-950/20">
              <span className="text-amber-600 dark:text-amber-400 block mb-1">MEDIUM</span>
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                {insights.severityDistribution['MEDIUM'] || 0}
              </span>
              <p className="text-[10px] text-amber-600/70 mt-1">Flows, custom fields, code</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-rose-50/40 dark:bg-rose-950/20">
              <span className="text-rose-600 dark:text-rose-400 block mb-1">HIGH / CRITICAL</span>
              <span className="text-2xl font-bold text-rose-700 dark:text-rose-300 tabular-nums">
                {(insights.severityDistribution['HIGH'] || 0) + (insights.severityDistribution['CRITICAL'] || 0)}
              </span>
              <p className="text-[10px] text-rose-600/70 mt-1">Permissions, SSO, security</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
