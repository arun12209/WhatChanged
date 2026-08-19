import { useState, useEffect, useCallback, useRef } from 'react';
import { ChangeEvent, ChangeStory, PageInfo, TimelineFilters } from '../domain/types';
import { fetchEvents } from '../data/whatChangedApi';

export function useChangeEvents(filters: TimelineFilters) {
  const [events, setEvents] = useState<ChangeEvent[]>([]);
  const [changeStories, setChangeStories] = useState<ChangeStory[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ hasNextPage: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const requestIdRef = useRef(0);

  const loadInitial = useCallback(async () => {
    const currentReqId = ++requestIdRef.current;
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetchEvents(filtersRef.current);
      if (currentReqId === requestIdRef.current) {
        setEvents(res.events);
        setChangeStories(res.changeStories || []);
        setPageInfo(res.pageInfo);
      }
    } catch (err: any) {
      if (currentReqId === requestIdRef.current) {
        setError(err);
      }
    } finally {
      if (currentReqId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [
    filters.range,
    filters.customFrom,
    filters.customTo,
    filters.category,
    filters.severity,
    filters.actorId,
    filters.actorName,
    filters.section,
    filters.search,
    filters.incidentModeEnabled,
    filters.incidentTime,
    filters.incidentWindowMinutes,
    loadInitial,
  ]);

  const loadMore = useCallback(async () => {
    if (!pageInfo.hasNextPage || !pageInfo.nextCursor || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const res = await fetchEvents(filtersRef.current, pageInfo.nextCursor);
      setEvents((prev) => [...prev, ...res.events]);
      setPageInfo(res.pageInfo);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [pageInfo, isLoadingMore]);

  const refresh = useCallback(() => {
    return loadInitial();
  }, [loadInitial]);

  return {
    events,
    changeStories,
    pageInfo,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refresh,
  };
}
