import { useState, useEffect, useCallback } from 'react';
import { TimelineFilters, ChangeCategory, ChangeSeverity, DateRangeOption } from '../domain/types';
import { readFiltersFromUrl, writeFiltersToUrl } from '../utils/urlState';

export function useTimelineFilters(initialOverrides?: Partial<TimelineFilters>) {
  const [filters, setFilters] = useState<TimelineFilters>(() => {
    const urlFilters = readFiltersFromUrl();
    return {
      ...urlFilters,
      ...initialOverrides,
    };
  });

  useEffect(() => {
    writeFiltersToUrl(filters);
  }, [filters]);

  const setRange = useCallback((range: DateRangeOption) => {
    setFilters((prev) => ({ ...prev, range }));
  }, []);

  const setCategory = useCallback((category: ChangeCategory | 'ALL') => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setSeverity = useCallback((severity: ChangeSeverity | 'ALL') => {
    setFilters((prev) => ({ ...prev, severity }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search: search.trim() ? search : undefined }));
  }, []);

  const setActor = useCallback((actorId?: string, actorName?: string) => {
    setFilters((prev) => ({ ...prev, actorId, actorName }));
  }, []);

  const setSection = useCallback((section?: string) => {
    setFilters((prev) => ({ ...prev, section }));
  }, []);

  const setIncidentMode = useCallback(
    (enabled: boolean, incidentTime?: string, windowMinutes = 30) => {
      setFilters((prev) => ({
        ...prev,
        incidentModeEnabled: enabled,
        incidentTime: enabled ? incidentTime || new Date().toISOString() : undefined,
        incidentWindowMinutes: enabled ? windowMinutes : undefined,
      }));
    },
    []
  );

  const setCustomDates = useCallback((customFrom?: string, customTo?: string) => {
    setFilters((prev) => ({
      ...prev,
      range: 'custom',
      customFrom,
      customTo,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      range: 'today',
      customFrom: undefined,
      customTo: undefined,
      category: 'ALL',
      severity: 'ALL',
      search: undefined,
      actorId: undefined,
      actorName: undefined,
      section: undefined,
      incidentModeEnabled: false,
      incidentTime: undefined,
    });
  }, []);

  const hasActiveFilters = Boolean(
    filters.category !== 'ALL' ||
      filters.severity !== 'ALL' ||
      filters.search ||
      filters.actorId ||
      filters.actorName ||
      filters.section ||
      filters.range !== 'today' ||
      filters.customFrom ||
      filters.customTo ||
      filters.incidentModeEnabled
  );

  return {
    filters,
    setFilters,
    setRange,
    setCustomDates,
    setCategory,
    setSeverity,
    setSearch,
    setActor,
    setSection,
    setIncidentMode,
    clearFilters,
    hasActiveFilters,
  };
}
