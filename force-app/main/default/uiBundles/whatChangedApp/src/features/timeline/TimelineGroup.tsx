import React from 'react';
import { ChangeEvent } from '../../domain/types';
import { TimelineEventCard } from './TimelineEventCard';

interface TimelineGroupProps {
  dateHeader: string;
  events: ChangeEvent[];
  isCompact?: boolean;
  onEventClick: (event: ChangeEvent) => void;
}

export const TimelineGroup: React.FC<TimelineGroupProps> = ({
  dateHeader,
  events,
  isCompact = false,
  onEventClick,
}) => {
  return (
    <div className="space-y-3 mb-8">
      {/* Date Header */}
      <div className="sticky top-16 z-10 py-1.5 bg-background/95 backdrop-blur-xs flex items-center gap-3">
        <span className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          {dateHeader}
        </span>
        <div className="h-px flex-1 bg-slate-200 dark:border-slate-800" />
        <span className="text-xs font-medium text-slate-400 tabular-nums">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      {/* Events List */}
      <div className={isCompact ? 'space-y-1.5' : 'space-y-3'}>
        {events.map((evt) => (
          <TimelineEventCard
            key={evt.id}
            event={evt}
            isCompact={isCompact}
            onClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
};
