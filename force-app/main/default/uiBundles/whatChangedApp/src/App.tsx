import React, { useState, useCallback } from 'react';
import { ViewTab, ChangeEvent, ChangeCategory, ChangeSeverity, Contributor } from './domain/types';
import { useTheme } from './hooks/useTheme';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { useChangeSummary } from './hooks/useChangeSummary';
import { useChangeEvents } from './hooks/useChangeEvents';
import { useTimelineFilters } from './hooks/useTimelineFilters';
import { usePeople } from './hooks/usePeople';
import { useInsights } from './hooks/useInsights';
import { useCommandPalette } from './hooks/useCommandPalette';
import { getClientConnectionStatus } from './data/salesforceClient';
import { Header } from './components/shell/Header';
import { CommandPalette } from './components/shell/CommandPalette';
import { OverviewView } from './features/overview/OverviewView';
import { TimelineView } from './features/timeline/TimelineView';
import { PeopleView } from './features/people/PeopleView';
import { InsightsView } from './features/insights/InsightsView';
import { AboutView } from './features/settings/AboutView';
import { EventDetailDrawer } from './features/event-detail/EventDetailDrawer';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('overview');
  const [selectedEvent, setSelectedEvent] = useState<ChangeEvent | null>(null);

  const { toggleTheme, isDark } = useTheme();
  const conn = getClientConnectionStatus();

  // Summary Data Hook
  const {
    summary,
    isLoading: isSummaryLoading,
    isRefreshing,
    error: summaryError,
    refresh: refreshSummary,
  } = useChangeSummary();

  // Filters Hook
  const {
    filters,
    setRange,
    setCategory,
    setSeverity,
    setSearch,
    setActor,
    setIncidentMode,
    clearFilters,
    hasActiveFilters,
  } = useTimelineFilters();

  // Change Events Hook
  const {
    events,
    changeStories,
    pageInfo,
    isLoading: isEventsLoading,
    isLoadingMore,
    error: eventsError,
    loadMore,
    refresh: refreshEvents,
  } = useChangeEvents(filters);

  // People Hook
  const {
    contributors,
    isLoading: isPeopleLoading,
    error: peopleError,
    refresh: refreshPeople,
  } = usePeople(filters.range === '30d' ? '30d' : '7d');

  // Insights Hook
  const {
    insights,
    isLoading: isInsightsLoading,
    error: insightsError,
    refresh: refreshInsights,
  } = useInsights(filters.range === '30d' ? '30d' : '7d');

  // Command Palette Hook
  const { isOpen: isCmdOpen, open: openCmd, close: closeCmd } = useCommandPalette();

  // Master Refresh
  const handleMasterRefresh = useCallback(async () => {
    await Promise.all([
      refreshSummary(),
      refreshEvents(),
      refreshPeople(),
      refreshInsights(filters.range === '30d' ? '30d' : '7d'),
    ]);
  }, [refreshSummary, refreshEvents, refreshPeople, refreshInsights, filters.range]);

  // Auto-refresh hook (polls every 60s while tab active)
  const { secondsAgo, markRefreshed } = useAutoRefresh(handleMasterRefresh, 60000);

  const handleManualRefresh = async () => {
    markRefreshed();
    await handleMasterRefresh();
  };

  const handleNavigateTimeline = (overrideFilters?: {
    category?: ChangeCategory | 'ALL';
    severity?: ChangeSeverity | 'ALL';
  }) => {
    setActor(undefined, undefined);
    setSearch('');
    if (overrideFilters) {
      if (overrideFilters.category) setCategory(overrideFilters.category);
      if (overrideFilters.severity) setSeverity(overrideFilters.severity);
    }
    setCurrentTab('timeline');
  };

  const handleContributorClick = (contrib: Contributor) => {
    setActor(contrib.actorId, contrib.actorName);
    setCurrentTab('timeline');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-150">
      {/* Shell Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        environment={summary?.environmentType || conn.environmentLabel}
        isRefreshing={isRefreshing}
        onRefresh={handleManualRefresh}
        secondsAgo={secondsAgo}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenCommandPalette={openCmd}
      />

      {/* Main Canvas Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <OverviewView
            summary={summary}
            isLoading={isSummaryLoading}
            isRefreshing={isRefreshing}
            error={summaryError}
            secondsAgo={secondsAgo}
            onRefresh={handleManualRefresh}
            onEventClick={setSelectedEvent}
            onNavigateTimeline={handleNavigateTimeline}
          />
        )}

        {currentTab === 'timeline' && (
          <TimelineView
            events={events}
            changeStories={changeStories}
            pageInfo={pageInfo}
            isLoading={isEventsLoading}
            isLoadingMore={isLoadingMore}
            error={eventsError}
            filters={filters}
            onRangeChange={setRange}
            onCategoryChange={setCategory}
            onSeverityChange={setSeverity}
            onSearchChange={setSearch}
            onActorChange={setActor}
            onIncidentModeToggle={(en, time, win) => setIncidentMode(en, time, win)}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            onLoadMore={loadMore}
            onRefresh={handleManualRefresh}
            onEventClick={setSelectedEvent}
          />
        )}

        {currentTab === 'insights' && (
          <InsightsView
            insights={insights}
            isLoading={isInsightsLoading}
            error={insightsError}
            onRefresh={refreshInsights}
          />
        )}

        {currentTab === 'people' && (
          <PeopleView
            contributors={contributors}
            isLoading={isPeopleLoading}
            error={peopleError}
            onRefresh={refreshPeople}
            onContributorClick={handleContributorClick}
          />
        )}

        {currentTab === 'about' && <AboutView />}
      </main>

      {/* Slide-over Right Event Detail Drawer */}
      <EventDetailDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* ⌘K Command Palette Modal */}
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={closeCmd}
        onNavigate={setCurrentTab}
        onApplyFilter={(cat, search) => {
          if (cat) setCategory(cat);
          if (search) setSearch(search);
        }}
        onRefresh={handleManualRefresh}
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />
    </div>
  );
};
