import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Flame,
  RotateCcw,
} from 'lucide-react';
import { TimelineFilters, ChangeCategory, ChangeSeverity, DateRangeOption } from '../../domain/types';
import { ALL_CATEGORIES, getCategoryMeta } from '../../domain/categories';
import { ALL_SEVERITIES } from '../../domain/severity';
import { Button } from '../../components/common/Button';

interface FilterBarProps {
  filters: TimelineFilters;
  onRangeChange: (range: DateRangeOption) => void;
  onCategoryChange: (category: ChangeCategory | 'ALL') => void;
  onSeverityChange: (severity: ChangeSeverity | 'ALL') => void;
  onSearchChange: (search: string) => void;
  onActorChange?: (actorId?: string, actorName?: string) => void;
  onIncidentModeToggle: (enabled: boolean) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onRangeChange,
  onCategoryChange,
  onSeverityChange,
  onSearchChange,
  onActorChange,
  onIncidentModeToggle,
  onClearFilters,
  hasActiveFilters,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        onSearchChange(searchInput);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, filters.search, onSearchChange]);

  const dateRanges: { id: DateRangeOption; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '24h', label: 'Last 24h' },
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
  ];

  return (
    <div className="space-y-3 mb-6">
      {/* Top filter controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search changes, metadata, users, actions... (/)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-surface border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Ranges & Incident Mode */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-surface p-0.5 shadow-sm">
            {dateRanges.map((r) => {
              const active = filters.range === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onRangeChange(r.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    active
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Severity Dropdown */}
          <select
            value={filters.severity || 'ALL'}
            onChange={(e) => onSeverityChange(e.target.value as ChangeSeverity | 'ALL')}
            className="text-xs bg-surface border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
          >
            <option value="ALL">All Severities</option>
            {ALL_SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Incident Mode Button */}
          <Button
            variant={filters.incidentModeEnabled ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onIncidentModeToggle(!filters.incidentModeEnabled)}
            className="flex items-center gap-1.5"
          >
            <Flame className={`w-3.5 h-3.5 ${filters.incidentModeEnabled ? 'text-amber-300' : 'text-rose-500'}`} />
            <span>Incident Mode</span>
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        <button
          onClick={() => onCategoryChange('ALL')}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            !filters.category || filters.category === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-surface border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          All Categories
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const meta = getCategoryMeta(cat);
          const Icon = meta.icon;
          const isActive = filters.category === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                isActive
                  ? `${meta.badgeBgLight} ${meta.badgeBgDark} border-current font-semibold shadow-xs`
                  : 'bg-surface border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3 h-3 flex-shrink-0" />
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Pills Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-slate-400">Active filters:</span>
          {filters.category && filters.category !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Category: {getCategoryMeta(filters.category).label}
              <X
                className="w-3 h-3 cursor-pointer hover:text-slate-900"
                onClick={() => onCategoryChange('ALL')}
              />
            </span>
          )}
          {filters.severity && filters.severity !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Severity: {filters.severity}
              <X
                className="w-3 h-3 cursor-pointer hover:text-slate-900"
                onClick={() => onSeverityChange('ALL')}
              />
            </span>
          )}
          {filters.actorName && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Actor: {filters.actorName}
              <X
                className="w-3 h-3 cursor-pointer hover:text-slate-900"
                onClick={() => onActorChange?.(undefined, undefined)}
              />
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Query: "{filters.search}"
              <X
                className="w-3 h-3 cursor-pointer hover:text-slate-900"
                onClick={() => onSearchChange('')}
              />
            </span>
          )}
        </div>
      )}
    </div>
  );
};
