import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OverviewView } from '../features/overview/OverviewView';
import { MOCK_SUMMARY } from '../data/mockData';

describe('OverviewView Component', () => {
  it('renders hero title and subtitle', () => {
    render(
      <OverviewView
        summary={MOCK_SUMMARY}
        isLoading={false}
        isRefreshing={false}
        error={null}
        secondsAgo={15}
        onRefresh={vi.fn()}
        onEventClick={vi.fn()}
        onNavigateTimeline={vi.fn()}
      />
    );

    expect(screen.getByText('What changed today?')).toBeInTheDocument();
    expect(screen.getByText(/A live view of configuration, automation/i)).toBeInTheDocument();
  });

  it('renders all 4 primary KPI cards with correct metric values', () => {
    render(
      <OverviewView
        summary={MOCK_SUMMARY}
        isLoading={false}
        isRefreshing={false}
        error={null}
        secondsAgo={15}
        onRefresh={vi.fn()}
        onEventClick={vi.fn()}
        onNavigateTimeline={vi.fn()}
      />
    );

    expect(screen.getByText('Changes Today')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
    expect(screen.getByText('+18% vs typical Monday')).toBeInTheDocument();

    expect(screen.getByText('2 Flow activations')).toBeInTheDocument();
    expect(screen.getByText('Permissions & users')).toBeInTheDocument();
    expect(screen.getAllByText('Worth a Look').length).toBeGreaterThan(0);
  });

  it('handles clicking KPI cards to trigger filtered timeline navigation', () => {
    const handleNavigate = vi.fn();
    render(
      <OverviewView
        summary={MOCK_SUMMARY}
        isLoading={false}
        isRefreshing={false}
        error={null}
        secondsAgo={15}
        onRefresh={vi.fn()}
        onEventClick={vi.fn()}
        onNavigateTimeline={handleNavigate}
      />
    );

    const automationSubtitle = screen.getByText('2 Flow activations');
    const automationKpi = automationSubtitle.closest('div[class*="cursor-pointer"]');
    if (automationKpi) {
      fireEvent.click(automationKpi);
      expect(handleNavigate).toHaveBeenCalledWith({ category: 'AUTOMATION' });
    }
  });

  it('renders Activity chart, Change mix and Attention items', () => {
    render(
      <OverviewView
        summary={MOCK_SUMMARY}
        isLoading={false}
        isRefreshing={false}
        error={null}
        secondsAgo={15}
        onRefresh={vi.fn()}
        onEventClick={vi.fn()}
        onNavigateTimeline={vi.fn()}
      />
    );

    expect(screen.getByText('Change Activity Today')).toBeInTheDocument();
    expect(screen.getByText('Change Mix')).toBeInTheDocument();
    expect(screen.getByText('Org sharing model changed for Account')).toBeInTheDocument();
  });

  it('renders dynamic title and handles date range changes in Overview', () => {
    const handleRangeChange = vi.fn();
    const { rerender } = render(
      <OverviewView
        summary={MOCK_SUMMARY}
        isLoading={false}
        isRefreshing={false}
        error={null}
        secondsAgo={15}
        onRefresh={vi.fn()}
        onEventClick={vi.fn()}
        onNavigateTimeline={vi.fn()}
        range="7d"
        onRangeChange={handleRangeChange}
      />
    );

    expect(screen.getByText('What changed in the last 7 days?')).toBeInTheDocument();
    expect(screen.getByText('Changes (7 Days)')).toBeInTheDocument();

    const last24hBtn = screen.getByRole('button', { name: 'Last 24h' });
    fireEvent.click(last24hBtn);
    expect(handleRangeChange).toHaveBeenCalledWith('24h');

    // Test custom date range
    rerender(
      <OverviewView
        summary={MOCK_SUMMARY}
        isLoading={false}
        isRefreshing={false}
        error={null}
        secondsAgo={15}
        onRefresh={vi.fn()}
        onEventClick={vi.fn()}
        onNavigateTimeline={vi.fn()}
        range="custom"
        customFrom="2026-08-10"
        customTo="2026-08-18"
        onRangeChange={handleRangeChange}
      />
    );

    expect(screen.getByText('What changed between 2026-08-10 → 2026-08-18?')).toBeInTheDocument();
    expect(screen.getByText('Changes in Period')).toBeInTheDocument();
  });
});
