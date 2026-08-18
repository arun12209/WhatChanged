import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TimelineView } from '../features/timeline/TimelineView';
import { MOCK_EVENTS, MOCK_CHANGE_STORIES } from '../data/mockData';
import { TimelineFilters } from '../domain/types';

const defaultFilters: TimelineFilters = {
  range: 'today',
  category: 'ALL',
  severity: 'ALL',
};

describe('TimelineView Component', () => {
  it('renders Timeline title and events stream', () => {
    render(
      <TimelineView
        events={MOCK_EVENTS}
        changeStories={MOCK_CHANGE_STORIES}
        pageInfo={{ hasNextPage: true, nextCursor: '20' }}
        isLoading={false}
        isLoadingMore={false}
        error={null}
        filters={defaultFilters}
        onRangeChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onSeverityChange={vi.fn()}
        onSearchChange={vi.fn()}
        onIncidentModeToggle={vi.fn()}
        onClearFilters={vi.fn()}
        hasActiveFilters={false}
        onLoadMore={vi.fn()}
        onRefresh={vi.fn()}
        onEventClick={vi.fn()}
      />
    );

    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Permission Set updated')).toBeInTheDocument();
    expect(screen.getAllByText('Flow activated').length).toBeGreaterThan(0);
    expect(screen.getByText('Deployment activity detected')).toBeInTheDocument();
  });

  it('renders Change Stories and toggles sub-events', () => {
    render(
      <TimelineView
        events={MOCK_EVENTS}
        changeStories={MOCK_CHANGE_STORIES}
        pageInfo={{ hasNextPage: false }}
        isLoading={false}
        isLoadingMore={false}
        error={null}
        filters={defaultFilters}
        onRangeChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onSeverityChange={vi.fn()}
        onSearchChange={vi.fn()}
        onIncidentModeToggle={vi.fn()}
        onClearFilters={vi.fn()}
        hasActiveFilters={false}
        onLoadMore={vi.fn()}
        onRefresh={vi.fn()}
        onEventClick={vi.fn()}
      />
    );

    expect(screen.getByText('Account permissions and custom fields updated')).toBeInTheDocument();
  });

  it('triggers onEventClick when an event card is clicked', () => {
    const handleEventClick = vi.fn();
    render(
      <TimelineView
        events={MOCK_EVENTS}
        changeStories={[]}
        pageInfo={{ hasNextPage: false }}
        isLoading={false}
        isLoadingMore={false}
        error={null}
        filters={defaultFilters}
        onRangeChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onSeverityChange={vi.fn()}
        onSearchChange={vi.fn()}
        onIncidentModeToggle={vi.fn()}
        onClearFilters={vi.fn()}
        hasActiveFilters={false}
        onLoadMore={vi.fn()}
        onRefresh={vi.fn()}
        onEventClick={handleEventClick}
      />
    );

    const eventTitle = screen.getByText('Permission Set updated');
    fireEvent.click(eventTitle);
    expect(handleEventClick).toHaveBeenCalledWith(MOCK_EVENTS[0]);
  });
});
