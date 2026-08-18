import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar } from '../features/timeline/FilterBar';
import { TimelineFilters } from '../domain/types';

describe('FilterBar Component', () => {
  it('renders search input, date ranges, section dropdown, and category pills', () => {
    const filters: TimelineFilters = {
      range: 'today',
      category: 'ALL',
      severity: 'ALL',
    };

    render(
      <FilterBar
        filters={filters}
        onRangeChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onSeverityChange={vi.fn()}
        onSectionChange={vi.fn()}
        onSearchChange={vi.fn()}
        onIncidentModeToggle={vi.fn()}
        onClearFilters={vi.fn()}
        hasActiveFilters={false}
      />
    );

    expect(
      screen.getByPlaceholderText(/Search changes, metadata, users, actions/i)
    ).toBeInTheDocument();
    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText('Automation')).toBeInTheDocument();
    expect(screen.getByText('Access')).toBeInTheDocument();
    expect(screen.getByText('All Sections')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('triggers category change when category pill clicked', () => {
    const handleCategoryChange = vi.fn();
    const filters: TimelineFilters = {
      range: 'today',
      category: 'ALL',
      severity: 'ALL',
    };

    render(
      <FilterBar
        filters={filters}
        onRangeChange={vi.fn()}
        onCategoryChange={handleCategoryChange}
        onSeverityChange={vi.fn()}
        onSectionChange={vi.fn()}
        onSearchChange={vi.fn()}
        onIncidentModeToggle={vi.fn()}
        onClearFilters={vi.fn()}
        hasActiveFilters={false}
      />
    );

    fireEvent.click(screen.getByText('Automation'));
    expect(handleCategoryChange).toHaveBeenCalledWith('AUTOMATION');
  });

  it('triggers section change when section dropdown changed', () => {
    const handleSectionChange = vi.fn();
    const filters: TimelineFilters = {
      range: 'today',
      category: 'ALL',
      severity: 'ALL',
    };

    render(
      <FilterBar
        filters={filters}
        onRangeChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onSeverityChange={vi.fn()}
        onSectionChange={handleSectionChange}
        onSearchChange={vi.fn()}
        onIncidentModeToggle={vi.fn()}
        onClearFilters={vi.fn()}
        hasActiveFilters={false}
      />
    );

    const sectionSelect = screen.getByTitle('Filter by Salesforce Setup Section');
    fireEvent.change(sectionSelect, { target: { value: 'Manage Users' } });
    expect(handleSectionChange).toHaveBeenCalledWith('Manage Users');
  });

  it('renders custom date inputs when range is custom', () => {
    const handleCustomDatesChange = vi.fn();
    const filters: TimelineFilters = {
      range: 'custom',
      customFrom: '2026-08-01',
      customTo: '2026-08-15',
      category: 'ALL',
      severity: 'ALL',
    };

    render(
      <FilterBar
        filters={filters}
        onRangeChange={vi.fn()}
        onCustomDatesChange={handleCustomDatesChange}
        onCategoryChange={vi.fn()}
        onSeverityChange={vi.fn()}
        onSectionChange={vi.fn()}
        onSearchChange={vi.fn()}
        onIncidentModeToggle={vi.fn()}
        onClearFilters={vi.fn()}
        hasActiveFilters={true}
      />
    );

    expect(screen.getByText('Custom Date Range:')).toBeInTheDocument();
    expect(screen.getByText('2026-08-01 → 2026-08-15')).toBeInTheDocument();
  });

  it('triggers incident mode toggle when button clicked', () => {
    const handleIncidentToggle = vi.fn();
    const filters: TimelineFilters = {
      range: 'today',
      category: 'ALL',
      severity: 'ALL',
    };

    render(
      <FilterBar
        filters={filters}
        onRangeChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onSeverityChange={vi.fn()}
        onSectionChange={vi.fn()}
        onSearchChange={vi.fn()}
        onIncidentModeToggle={handleIncidentToggle}
        onClearFilters={vi.fn()}
        hasActiveFilters={false}
      />
    );

    fireEvent.click(screen.getByText('Incident Mode'));
    expect(handleIncidentToggle).toHaveBeenCalledWith(true);
  });
});
