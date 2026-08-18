import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Flame,
  RotateCcw,
  Calendar,
  Layers,
} from 'lucide-react';
import { TimelineFilters, ChangeCategory, ChangeSeverity, DateRangeOption } from '../../domain/types';
import { ALL_CATEGORIES, getCategoryMeta } from '../../domain/categories';
import { ALL_SEVERITIES } from '../../domain/severity';
import { Button } from '../../components/common/Button';

export const KNOWN_SALESFORCE_SECTIONS = [
  'Manage Users',
  'Process Automation',
  'Custom Objects',
  'Security Controls',
  'Apex Classes',
  'Lightning Pages',
  'Named Credentials',
  'Sharing Settings',
  'Deployment',
  'Custom Labels',
  'Company Information',
];

interface FilterBarProps {
  filters: TimelineFilters;
  onRangeChange: (range: DateRangeOption) => void;
  onCustomDatesChange?: (from?: string, to?: string) => void;
  onCategoryChange: (category: ChangeCategory | 'ALL') => void;
  onSeverityChange: (severity: ChangeSeverity | 'ALL') => void;
  onSectionChange?: (section?: string) => void;
  onSearchChange: (search: string) => void;
  onActorChange?: (actorId?: string, actorName?: string) => void;
  onIncidentModeToggle: (enabled: boolean) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
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
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [customFrom, setCustomFrom] = useState(filters.customFrom || '');
  const [customTo, setCustomTo] = useState(filters.customTo || '');

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    setCustomFrom(filters.customFrom || '');
    setCustomTo(filters.customTo || '');
  }, [filters.customFrom, filters.customTo]);

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
    { id: 'custom', label: 'Custom' },
  ];

  const handleCustomDateApply = () => {
    if (onCustomDatesChange) {
      onCustomDatesChange(customFrom || undefined, customTo || undefined);
    }
  };

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
            className="w-full pl-9 pr-8 py-2 text-sm bg-surface border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Ranges, Section, Severity, Incident Mode & Clear */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date range segmented button */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-surface p-0.5 shadow-xs">
            {dateRanges.map((r) => {
              const active = filters.range === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onRangeChange(r.id)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
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

          {/* Salesforce Section Dropdown */}
          <div className="relative">
            <select
              value={filters.section || 'ALL'}
              onChange={(e) => onSectionChange?.(e.target.value === 'ALL' ? undefined : e.target.value)}
              className="text-xs bg-surface border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs max-w-[140px] truncate"
              title="Filter by Salesforce Setup Section"
            >
              <option value="ALL">All Sections</option>
              {KNOWN_SALESFORCE_SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Dropdown */}
          <select
            value={filters.severity || 'ALL'}
            onChange={(e) => onSeverityChange(e.target.value as ChangeSeverity | 'ALL')}
            className="text-xs bg-surface border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
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
              className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Custom Date Range Picker Bar (Shown when range === 'custom') */}
      {filters.range === 'custom' && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center gap-3 text-xs animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <Calendar className="w-4 h-4 text-sky-500" />
            <span>Custom Date Range:</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">From</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => {
                setCustomFrom(e.target.value);
                if (onCustomDatesChange) {
                  onCustomDatesChange(e.target.value || undefined, customTo || undefined);
                }
              }}
              className="bg-surface border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">To</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => {
                setCustomTo(e.target.value);
                if (onCustomDatesChange) {
                  onCustomDatesChange(customFrom || undefined, e.target.value || undefined);
                }
              }}
              className="bg-surface border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {(customFrom || customTo) && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleCustomDateApply}>
                Apply
              </Button>
              <button
                onClick={() => {
                  setCustomFrom('');
                  setCustomTo('');
                  onCustomDatesChange?.(undefined, undefined);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs underline"
              >
                Reset dates
              </button>
            </div>
          )}
        </div>
      )}

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

          {/* Custom Date Range Pill */}
          {filters.range === 'custom' && (filters.customFrom || filters.customTo) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
              <Calendar className="w-3 h-3 text-sky-500" />
              <span>
                {filters.customFrom || 'Start'} → {filters.customTo || 'Now'}
              </span>
              <X
                className="w-3 h-3 cursor-pointer hover:text-sky-900 dark:hover:text-sky-100"
                onClick={() => onCustomDatesChange?.(undefined, undefined)}
              />
            </span>
          )}

          {/* Category Pill */}
          {filters.category && filters.category !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
              Category: {getCategoryMeta(filters.category).label}
              <X
                className="w-3 h-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => onCategoryChange('ALL')}
              />
            </span>
          )}

          {/* Section Pill */}
          {filters.section && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
              <Layers className="w-3 h-3 text-slate-500" />
              Section: {filters.section}
              <X
                className="w-3 h-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => onSectionChange?.(undefined)}
              />
            </span>
          )}

          {/* Severity Pill */}
          {filters.severity && filters.severity !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
              Severity: {filters.severity}
              <X
                className="w-3 h-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => onSeverityChange('ALL')}
              />
            </span>
          )}

          {/* Actor Pill */}
          {filters.actorName && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
              Actor: {filters.actorName}
              <X
                className="w-3 h-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => onActorChange?.(undefined, undefined)}
              />
            </span>
          )}

          {/* Search Query Pill */}
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
              Query: "{filters.search}"
              <X
                className="w-3 h-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => onSearchChange('')}
              />
            </span>
          )}
        </div>
      )}
    </div>
  );
};
