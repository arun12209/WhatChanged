import React from 'react';
import { ChangeSummary, ChangeEvent, AttentionItem, ChangeCategory, SeverityFilter, DateRangeOption } from '../../domain/types';
import { Hero } from '../../components/shell/Hero';
import { KpiCards } from './KpiCards';
import { ActivityChart } from './ActivityChart';
import { ChangeMix } from './ChangeMix';
import { AttentionPanel } from './AttentionPanel';
import { RecentChangesList } from './RecentChangesList';
import { KpiCardSkeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { ErrorBanner } from '../../components/common/ErrorBanner';

interface OverviewViewProps {
  summary: ChangeSummary | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  secondsAgo: number;
  onRefresh: () => void;
  onEventClick: (event: ChangeEvent) => void;
  onNavigateTimeline: (filters?: { category?: ChangeCategory | 'ALL'; severity?: SeverityFilter }) => void;
  range?: DateRangeOption;
  customFrom?: string;
  customTo?: string;
  onRangeChange?: (range: DateRangeOption) => void;
  onCustomDatesChange?: (from?: string, to?: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  summary,
  isLoading,
  isRefreshing,
  error,
  secondsAgo,
  onRefresh,
  onEventClick,
  onNavigateTimeline,
  range = 'today',
  customFrom = '',
  customTo = '',
  onRangeChange,
  onCustomDatesChange,
}) => {
  if (error && !summary) {
    const isForbidden = (error as any).code === 'FORBIDDEN' || (error as any).statusCode === 403;
    return <ErrorState isForbidden={isForbidden} message={error.message} onRetry={onRefresh} />;
  }

  if (isLoading && !summary) {
    return (
      <div className="space-y-6">
        <Hero
          secondsAgo={secondsAgo}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          range={range}
          customFrom={customFrom}
          customTo={customTo}
          onRangeChange={onRangeChange}
          onCustomDatesChange={onCustomDatesChange}
          isLoading={isLoading}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const handleAttentionClick = (item: AttentionItem) => {
    if (item.filterParam) {
      if (item.filterParam.includes('severity=ELEVATED')) {
        onNavigateTimeline({ severity: 'ELEVATED' });
      } else if (item.filterParam.includes('severity=CRITICAL')) {
        onNavigateTimeline({ severity: 'CRITICAL' });
      } else if (item.filterParam.includes('severity=HIGH')) {
        onNavigateTimeline({ severity: 'HIGH' });
      } else if (item.filterParam.includes('category=ACCESS')) {
        onNavigateTimeline({ category: 'ACCESS' });
      } else if (item.filterParam.includes('category=AUTOMATION')) {
        onNavigateTimeline({ category: 'AUTOMATION' });
      } else {
        onNavigateTimeline();
      }
    } else {
      onNavigateTimeline();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {error && <ErrorBanner message={error.message} onRetry={onRefresh} />}
      <Hero
        secondsAgo={secondsAgo}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        range={range}
        customFrom={customFrom}
        customTo={customTo}
        onRangeChange={onRangeChange}
        onCustomDatesChange={onCustomDatesChange}
        isLoading={isLoading}
      />

      <div className={`space-y-6 transition-opacity duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {/* 4 KPI Cards */}
        <KpiCards
          summary={summary}
          range={range}
          onFilterClick={onNavigateTimeline}
        />

        {/* Visual Activity & Attention Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityChart data={summary.hourlyActivity} />
          </div>
          <div className="lg:col-span-1">
            <AttentionPanel
              items={summary.attentionItems}
              onItemClick={handleAttentionClick}
            />
          </div>
        </div>

        {/* Change Mix & Recent Changes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ChangeMix
              data={summary.categoryMix}
              onCategoryClick={(cat) => onNavigateTimeline({ category: cat })}
            />
          </div>
          <div className="lg:col-span-2">
            <RecentChangesList
              events={summary.recentChanges}
              onEventClick={onEventClick}
              onViewAllClick={() => onNavigateTimeline()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
