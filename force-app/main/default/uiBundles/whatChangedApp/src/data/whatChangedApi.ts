import {
  ChangeSummary,
  ChangeEventsResponse,
  Contributor,
  Insights,
  TimelineFilters,
} from '../domain/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../domain/constants';
import { sfdcFetch, isSalesforceEnvironment } from './salesforceClient';
import {
  MOCK_SUMMARY,
  MOCK_EVENTS,
  MOCK_CHANGE_STORIES,
  MOCK_CONTRIBUTORS,
  MOCK_INSIGHTS,
} from './mockData';

export class WhatChangedApiError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code = 'API_ERROR', statusCode?: number) {
    super(message);
    this.name = 'WhatChangedApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Helper: handles HTTP response errors uniformly
 */
async function handleResponse<T>(res: Response, label: string): Promise<T> {
  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch { /* ignore */ }
    if (res.status === 403) {
      throw new WhatChangedApiError(
        `Permission denied for ${label}. ${body}`,
        'FORBIDDEN',
        403
      );
    }
    throw new WhatChangedApiError(
      `${label} failed (${res.status}): ${res.statusText}. ${body}`,
      'API_ERROR',
      res.status
    );
  }
  return (await res.json()) as T;
}

/**
 * @description Fetches executive change summary and KPIs
 */
export async function fetchSummary(): Promise<ChangeSummary> {
  if (!isSalesforceEnvironment()) {
    await delay(120);
    return { ...MOCK_SUMMARY, lastRefreshedAt: new Date().toISOString() };
  }

  const res = await sfdcFetch(API_ENDPOINTS.SUMMARY);
  return handleResponse<ChangeSummary>(res, 'Summary');
}

/**
 * @description Fetches paginated & filtered change events
 */
export async function fetchEvents(
  filters: TimelineFilters,
  cursor?: string,
  limit = DEFAULT_PAGE_SIZE
): Promise<ChangeEventsResponse> {
  if (!isSalesforceEnvironment()) {
    await delay(150);
    return filterMockEvents(filters, cursor, limit);
  }

  const queryParams = new URLSearchParams();
  if (filters.category && filters.category !== 'ALL') queryParams.append('category', filters.category);
  if (filters.severity && filters.severity !== 'ALL') queryParams.append('severity', filters.severity);
  if (filters.actorId) queryParams.append('actorId', filters.actorId);
  if (filters.section) queryParams.append('section', filters.section);
  if (filters.search) queryParams.append('search', filters.search);
  if (cursor) queryParams.append('cursor', cursor);
  if (limit) queryParams.append('limit', limit.toString());

  // Date range filtering
  if (!filters.incidentModeEnabled && filters.range) {
    const now = new Date();
    if (filters.range === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      queryParams.append('from', todayStart.toISOString());
    } else if (filters.range === '24h') {
      const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      queryParams.append('from', past24h.toISOString());
    } else if (filters.range === '7d') {
      const past7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      queryParams.append('from', past7d.toISOString());
    } else if (filters.range === '30d') {
      const past30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      queryParams.append('from', past30d.toISOString());
    } else if (filters.range === 'custom') {
      if (filters.customFrom) {
        const [fYear, fMonth, fDay] = filters.customFrom.split('-').map(Number);
        const fromDate = new Date(fYear, fMonth - 1, fDay, 0, 0, 0, 0);
        if (!isNaN(fromDate.getTime())) {
          queryParams.append('from', fromDate.toISOString());
        }
      }
      if (filters.customTo) {
        const [tYear, tMonth, tDay] = filters.customTo.split('-').map(Number);
        const toDate = new Date(tYear, tMonth - 1, tDay, 23, 59, 59, 999);
        if (!isNaN(toDate.getTime())) {
          queryParams.append('to', toDate.toISOString());
        }
      }
    }
  }

  if (filters.incidentModeEnabled && filters.incidentTime) {
    queryParams.append('incidentTime', filters.incidentTime);
    queryParams.append('incidentWindowMinutes', (filters.incidentWindowMinutes || 30).toString());
  }

  const url = `${API_ENDPOINTS.EVENTS}?${queryParams.toString()}`;
  const res = await sfdcFetch(url);
  return handleResponse<ChangeEventsResponse>(res, 'Events');
}

/**
 * @description Fetches contributor ranking and statistics
 */
export async function fetchPeople(range = '7d'): Promise<Contributor[]> {
  if (!isSalesforceEnvironment()) {
    await delay(120);
    return MOCK_CONTRIBUTORS;
  }

  const url = `${API_ENDPOINTS.PEOPLE}?range=${range}`;
  const res = await sfdcFetch(url);
  return handleResponse<Contributor[]>(res, 'People');
}

/**
 * @description Fetches analytics insights and longitudinal metrics
 */
export async function fetchInsights(range = '7d'): Promise<Insights> {
  if (!isSalesforceEnvironment()) {
    await delay(120);
    return MOCK_INSIGHTS;
  }

  const url = `${API_ENDPOINTS.INSIGHTS}?range=${range}`;
  const res = await sfdcFetch(url);
  return handleResponse<Insights>(res, 'Insights');
}

function filterMockEvents(
  filters: TimelineFilters,
  cursor?: string,
  limit = DEFAULT_PAGE_SIZE
): ChangeEventsResponse {
  let list = [...MOCK_EVENTS];

  if (!filters.incidentModeEnabled && filters.range) {
    const now = new Date();
    let minDateMs = 0;
    if (filters.range === 'today') {
      minDateMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    } else if (filters.range === '24h') {
      minDateMs = now.getTime() - 24 * 60 * 60 * 1000;
    } else if (filters.range === '7d') {
      minDateMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    } else if (filters.range === '30d') {
      minDateMs = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    } else if (filters.range === 'custom') {
      if (filters.customFrom) {
        const [fYear, fMonth, fDay] = filters.customFrom.split('-').map(Number);
        const fromMs = new Date(fYear, fMonth - 1, fDay, 0, 0, 0, 0).getTime();
        if (!isNaN(fromMs)) {
          list = list.filter((e) => new Date(e.createdDate).getTime() >= fromMs);
        }
      }
      if (filters.customTo) {
        const [tYear, tMonth, tDay] = filters.customTo.split('-').map(Number);
        const toMs = new Date(tYear, tMonth - 1, tDay, 23, 59, 59, 999).getTime();
        if (!isNaN(toMs)) {
          list = list.filter((e) => new Date(e.createdDate).getTime() <= toMs);
        }
      }
    }
    if (minDateMs > 0 && filters.range !== 'custom') {
      list = list.filter((e) => new Date(e.createdDate).getTime() >= minDateMs);
    }
  }

  if (filters.category && filters.category !== 'ALL') {
    list = list.filter((e) => e.category === filters.category);
  }

  if (filters.severity && filters.severity !== 'ALL') {
    if (filters.severity === 'ELEVATED') {
      list = list.filter((e) => e.severity === 'HIGH' || e.severity === 'CRITICAL');
    } else {
      list = list.filter((e) => e.severity === filters.severity);
    }
  }

  if (filters.actorId) {
    list = list.filter((e) => e.actor.id === filters.actorId);
  }

  if (filters.actorName) {
    list = list.filter((e) =>
      e.actor.name.toLowerCase().includes(filters.actorName!.toLowerCase())
    );
  }

  if (filters.section) {
    list = list.filter((e) => e.section === filters.section);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.actor.name.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.section.toLowerCase().includes(q) ||
        (e.searchTokens && e.searchTokens.some((t) => t.includes(q)))
    );
  }

  if (filters.incidentModeEnabled && filters.incidentTime) {
    const targetMs = new Date(filters.incidentTime).getTime();
    const windowMs = (filters.incidentWindowMinutes || 30) * 60 * 1000;
    list = list.filter((e) => {
      const eMs = new Date(e.createdDate).getTime();
      return Math.abs(eMs - targetMs) <= windowMs;
    });
  }

  const offset = cursor ? parseInt(cursor, 10) : 0;
  const sliced = list.slice(offset, offset + limit);
  const nextOffset = offset + limit < list.length ? (offset + limit).toString() : undefined;

  return {
    events: sliced,
    pageInfo: {
      hasNextPage: Boolean(nextOffset),
      nextCursor: nextOffset,
      totalCount: list.length,
    },
    changeStories: offset === 0 ? MOCK_CHANGE_STORIES : [],
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
