import React from 'react';
import { Activity, Cpu, Lock, ShieldAlert } from 'lucide-react';
import { ChangeSummary, ChangeCategory, SeverityFilter } from '../../domain/types';
import { Card } from '../../components/common/Card';

interface KpiCardsProps {
  summary: ChangeSummary;
  onFilterClick: (filter: { category?: ChangeCategory | 'ALL'; severity?: SeverityFilter }) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary, onFilterClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Changes Today */}
      <Card
        hoverable
        onClick={() => onFilterClick({ category: 'ALL', severity: 'ALL' })}
        className="p-5 cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Changes Today</span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {summary.totalChangesToday}
        </div>
        <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span className="text-sky-600 dark:text-sky-400 font-semibold">{summary.baselineStatus}</span>
        </div>
      </Card>

      {/* 2. Automation Changes */}
      <Card
        hoverable
        onClick={() => onFilterClick({ category: 'AUTOMATION' })}
        className="p-5 cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Automation</span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {summary.automationChangesToday}
        </div>
        <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          {summary.automationSubtitle || 'Flows & workflows'}
        </div>
      </Card>

      {/* 3. Access Changes */}
      <Card
        hoverable
        onClick={() => onFilterClick({ category: 'ACCESS' })}
        className="p-5 cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Access</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Lock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {summary.accessChangesToday}
        </div>
        <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          {summary.accessSubtitle || 'Permissions & users'}
        </div>
      </Card>

      {/* 4. High Interest / Review Recommended (HIGH + CRITICAL) */}
      <Card
        hoverable
        onClick={() => onFilterClick({ severity: 'ELEVATED' })}
        className="p-5 cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Worth a Look</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {summary.highInterestChangesToday}
        </div>
        <div className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400 font-medium">
          {summary.highInterestSubtitle || 'Review recommended'}
        </div>
      </Card>
    </div>
  );
};
