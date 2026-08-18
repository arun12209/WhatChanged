import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChangeEvent } from '../../domain/types';
import { getCategoryMeta } from '../../domain/categories';
import { SeverityBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { HighlightText } from '../../components/common/HighlightText';

interface RecentChangesListProps {
  events: ChangeEvent[];
  searchQuery?: string;
  onEventClick: (event: ChangeEvent) => void;
  onViewAllClick: () => void;
}

export const RecentChangesList: React.FC<RecentChangesListProps> = ({
  events,
  searchQuery,
  onEventClick,
  onViewAllClick,
}) => {
  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Recent Changes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Latest audit trail entries recorded today
          </p>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 group transition-colors"
        >
          <span>View full timeline</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {events.map((evt) => {
          const catMeta = getCategoryMeta(evt.category);
          const Icon = catMeta.icon;

          return (
            <div
              key={evt.id}
              onClick={() => onEventClick(evt)}
              className="py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500 tabular-nums w-16 flex-shrink-0">
                  {evt.formattedTime}
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${catMeta.dotColor}15`,
                    color: catMeta.dotColor,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    <HighlightText text={evt.title} query={searchQuery} />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                    <HighlightText text={evt.description} query={searchQuery} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 hidden sm:inline">
                  <HighlightText text={evt.actor.name} query={searchQuery} />
                </span>
                <SeverityBadge severity={evt.severity} size="sm" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
