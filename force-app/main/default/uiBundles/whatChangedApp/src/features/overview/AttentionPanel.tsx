import React from 'react';
import { ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { AttentionItem } from '../../domain/types';
import { Card } from '../../components/common/Card';
import { SeverityBadge } from '../../components/common/Badge';

interface AttentionPanelProps {
  items: AttentionItem[];
  onItemClick: (item: AttentionItem) => void;
}

export const AttentionPanel: React.FC<AttentionPanelProps> = ({ items, onItemClick }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Worth a Look
          </h2>
        </div>
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
          Rule-based heuristics
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-semibold">Nothing unusual detected</div>
            <div className="text-xs text-emerald-700/80 dark:text-emerald-300/70 mt-0.5">
              All platform changes today match standard benign operational patterns.
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            return (
              <div
                key={item.id}
                onClick={() => onItemClick(item)}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={item.severity} size="sm" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.reason}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
