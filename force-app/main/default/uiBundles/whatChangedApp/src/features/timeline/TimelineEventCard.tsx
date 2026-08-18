import React from 'react';
import { ChangeEvent } from '../../domain/types';
import { getCategoryMeta } from '../../domain/categories';
import { CategoryBadge, SeverityBadge } from '../../components/common/Badge';

interface TimelineEventCardProps {
  event: ChangeEvent;
  isCompact?: boolean;
  onClick: (event: ChangeEvent) => void;
}

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  isCompact = false,
  onClick,
}) => {
  const catMeta = getCategoryMeta(event.category);
  const Icon = catMeta.icon;

  if (isCompact) {
    return (
      <div
        onClick={() => onClick(event)}
        className="py-2.5 px-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-surface hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 tabular-nums w-16 flex-shrink-0">
            {event.formattedTime}
          </span>
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${catMeta.dotColor}15`,
              color: catMeta.dotColor,
            }}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {event.title}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm hidden md:inline">
            — {event.description}
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {event.actor.name}
          </span>
          <CategoryBadge category={event.category} showIcon={false} size="sm" />
          <SeverityBadge severity={event.severity} size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(event)}
      className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-surface hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left icon + content */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5"
            style={{
              backgroundColor: `${catMeta.dotColor}18`,
              color: catMeta.dotColor,
            }}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {event.title}
              </span>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                · {event.relativeTime} ({event.formattedTime})
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              {event.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <CategoryBadge category={event.category} size="sm" />
              <SeverityBadge severity={event.severity} size="sm" />
              {event.section && (
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80">
                  {event.section}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right actor profile */}
        <div className="flex items-center gap-2 flex-shrink-0 text-right">
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">
              {event.actor.name}
            </div>
            {event.delegatedUser && (
              <div className="text-[10px] text-slate-400">
                via {event.delegatedUser}
              </div>
            )}
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {event.actor.name.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};
