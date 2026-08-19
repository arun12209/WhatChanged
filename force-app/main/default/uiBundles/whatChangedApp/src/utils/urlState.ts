import { TimelineFilters, ChangeCategory, SeverityFilter, DateRangeOption } from '../domain/types';

export function readFiltersFromUrl(): TimelineFilters {
  if (typeof window === 'undefined') {
    return { range: 'today', category: 'ALL', severity: 'ALL' };
  }

  const params = new URLSearchParams(window.location.search);
  const range = (params.get('range') as DateRangeOption) || 'today';
  const category = (params.get('category') as ChangeCategory | 'ALL') || 'ALL';
  const severity = (params.get('severity') as SeverityFilter) || 'ALL';
  const customFrom = params.get('customFrom') || undefined;
  const customTo = params.get('customTo') || undefined;
  const actorId = params.get('actorId') || undefined;
  const actorName = params.get('actorName') || undefined;
  const section = params.get('section') || undefined;
  const search = params.get('search') || undefined;
  const incidentTime = params.get('incidentTime') || undefined;
  const incidentWindowMinutes = params.get('incidentWindow') ? parseInt(params.get('incidentWindow')!, 10) : undefined;
  const incidentModeEnabled = params.get('incidentMode') === 'true';

  return {
    range,
    customFrom,
    customTo,
    category,
    severity,
    actorId,
    actorName,
    section,
    search,
    incidentTime,
    incidentWindowMinutes,
    incidentModeEnabled,
  };
}

export function writeFiltersToUrl(filters: TimelineFilters): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams();

  if (filters.range && filters.range !== 'today') params.set('range', filters.range);
  if (filters.customFrom) params.set('customFrom', filters.customFrom);
  if (filters.customTo) params.set('customTo', filters.customTo);
  if (filters.category && filters.category !== 'ALL') params.set('category', filters.category);
  if (filters.severity && filters.severity !== 'ALL') params.set('severity', filters.severity);
  if (filters.actorId) params.set('actorId', filters.actorId);
  if (filters.actorName) params.set('actorName', filters.actorName);
  if (filters.section) params.set('section', filters.section);
  if (filters.search) params.set('search', filters.search);
  if (filters.incidentModeEnabled) params.set('incidentMode', 'true');
  if (filters.incidentTime) params.set('incidentTime', filters.incidentTime);
  if (filters.incidentWindowMinutes) params.set('incidentWindow', filters.incidentWindowMinutes.toString());

  const queryString = params.toString();
  const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`;
  window.history.replaceState(null, '', newUrl);
}
