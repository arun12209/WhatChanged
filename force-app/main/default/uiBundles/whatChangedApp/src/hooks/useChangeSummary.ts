import { useState, useEffect, useCallback, useRef } from 'react';
import { ChangeSummary, DateRangeOption } from '../domain/types';
import { fetchSummary } from '../data/whatChangedApi';

export function useChangeSummary(
  range: DateRangeOption = 'today',
  customFrom?: string,
  customTo?: string
) {
  const [summary, setSummary] = useState<ChangeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const loadSummary = useCallback(async (refresh = false) => {
    const currentReqId = ++requestIdRef.current;
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const data = await fetchSummary(range, customFrom, customTo);
      if (currentReqId === requestIdRef.current) {
        setSummary(data);
      }
    } catch (err: any) {
      if (currentReqId === requestIdRef.current) {
        setError(err);
      }
    } finally {
      if (currentReqId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [range, customFrom, customTo]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const refresh = useCallback(() => {
    return loadSummary(true);
  }, [loadSummary]);

  return { summary, isLoading, isRefreshing, error, refresh };
}
