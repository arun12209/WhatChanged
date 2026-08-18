import React, { useState, useMemo } from 'react';
import {
  Layers,
  ArrowDown,
} from 'lucide-react';
import {
  ChangeEvent,
  ChangeStory,
  PageInfo,
  TimelineFilters,
  ChangeCategory,
  ChangeSeverity,
  DateRangeOption,
} from '../../domain/types';
import { formatDateHeader } from '../../utils/date';
import { FilterBar } from './FilterBar';
import { IncidentModeBar } from './IncidentModeBar';
import { TimelineGroup } from './TimelineGroup';
import { ChangeStoryCard } from './ChangeStoryCard';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { TimelineRowSkeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';

interface TimelineViewProps {
  events: ChangeEvent[];
  changeStories: ChangeStory[];
  pageInfo: PageInfo;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  filters: TimelineFilters;
  onRangeChange: (range: DateRangeOption) => void;
  onCustomDatesChange?: (from?: string, to?: string) => void;
  onCategoryChange: (category: ChangeCategory | 'ALL') => void;
  onSeverityChange: (severity: ChangeSeverity | 'ALL') => void;
  onSectionChange?: (section?: string) => void;
  onSearchChange: (search: string) => void;
  onActorChange?: (actorId?: string, actorName?: string) => void;
  onIncidentModeToggle: (enabled: boolean, time?: string, window?: number) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onEventClick: (event: ChangeEvent) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  changeStories,
  pageInfo,
  isLoading,
  isLoadingMore,
  error,
  filters,
  onRangeChange,
  onCustomDatesChange,
  onCategoryChange,
  onSeverityChange,
  onSectionChange,
  onSearchChange,
  onActorChange,
  onIncidentModeToggle,
  onClearFilters,
  hasActiveFilters,
  onLoadMore,
  onRefresh,
  onEventClick,
}) => {
  const [isCompact, setIsCompact] = useState(false);
  const [showStories, setShowStories] = useState(true);

  // Group events by day header (TODAY, YESTERDAY, specific date)
  const groupedEvents = useMemo(() => {
    const groups: { dateHeader: string; events: ChangeEvent[] }[] = [];
    const groupMap = new Map<string, ChangeEvent[]>();

    for (const evt of events) {
      const header = formatDateHeader(evt.createdDate);
      if (!groupMap.has(header)) {
        groupMap.set(header, []);
        groups.push({ dateHeader: header, events: groupMap.get(header)! });
      }
      groupMap.get(header)!.push(evt);
    }
    return groups;
  }, [events]);

  if (error) {
    const isForbidden = (error as any).code === 'FORBIDDEN' || (error as any).statusCode === 403;
    return <ErrorState isForbidden={isForbidden} onRetry={onRefresh} />;
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header bar with count & density toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Timeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Searchable, normalized stream of Salesforce configuration events
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Change Stories Toggle */}
          {changeStories.length > 0 && (
            <button
              onClick={() => setShowStories((prev) => !prev)}
              className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                showStories
                  ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                  : 'bg-surface border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Change Stories ({changeStories.length})</span>
            </button>
          )}

          {/* Density toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-surface text-xs">
            <button
              onClick={() => setIsCompact(false)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                !isCompact
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Comfortable
            </button>
            <button
              onClick={() => setIsCompact(true)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                isCompact
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Compact
            </button>
          </div>
        </div>
      </div>

      {/* Incident Mode Header Bar */}
      {filters.incidentModeEnabled && (
        <IncidentModeBar
          incidentTime={filters.incidentTime}
          incidentWindowMinutes={filters.incidentWindowMinutes}
          onApply={(time, windowMins) => onIncidentModeToggle(true, time, windowMins)}
          onClose={() => onIncidentModeToggle(false)}
        />
      )}

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onRangeChange={onRangeChange}
        onCustomDatesChange={onCustomDatesChange}
        onCategoryChange={onCategoryChange}
        onSeverityChange={onSeverityChange}
        onSectionChange={onSectionChange}
        onSearchChange={onSearchChange}
        onActorChange={onActorChange}
        onIncidentModeToggle={(en) => onIncidentModeToggle(en)}
        onClearFilters={onClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Loading Skeletons */}
      {isLoading && events.length === 0 ? (
        <div className="space-y-3 pt-2">
          <TimelineRowSkeleton />
          <TimelineRowSkeleton />
          <TimelineRowSkeleton />
          <TimelineRowSkeleton />
          <TimelineRowSkeleton />
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <EmptyState
          title={hasActiveFilters ? 'No changes found' : 'Quiet day'}
          description={
            hasActiveFilters
              ? 'No Salesforce setup changes matched your current filter criteria. Try adjusting your filters or search keywords.'
              : 'No Salesforce setup modifications have been detected for this period.'
          }
          actionLabel={hasActiveFilters ? 'Clear filters' : undefined}
          onAction={hasActiveFilters ? onClearFilters : undefined}
        />
      ) : (
        /* Render Stories and Events */
        <div className="space-y-6">
          {/* Change Stories Group */}
          {showStories && changeStories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                <span>Detected Change Stories</span>
              </div>
              {changeStories.map((story) => (
                <ChangeStoryCard
                  key={story.id}
                  story={story}
                  searchQuery={filters.search}
                  onEventClick={onEventClick}
                />
              ))}
            </div>
          )}

          {/* Grouped Day Timelines */}
          {groupedEvents.map((group) => (
            <TimelineGroup
              key={group.dateHeader}
              dateHeader={group.dateHeader}
              events={group.events}
              isCompact={isCompact}
              searchQuery={filters.search}
              onEventClick={onEventClick}
            />
          ))}

          {/* Keyset Load More Button */}
          {pageInfo.hasNextPage && (
            <div className="flex justify-center pt-4 pb-8">
              <Button
                variant="outline"
                size="md"
                onClick={onLoadMore}
                isLoading={isLoadingMore}
                className="w-full sm:w-auto px-8"
              >
                <ArrowDown className="w-4 h-4 mr-1.5" />
                <span>Load older changes</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
