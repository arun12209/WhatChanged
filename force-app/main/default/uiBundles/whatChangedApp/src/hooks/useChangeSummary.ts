import { useState, useEffect, useCallback } from 'react';
import { ChangeSummary } from '../domain/types';
import { fetchSummary } from '../data/whatChangedApi';

export function useChangeSummary() {
  const [summary, setSummary] = useState<ChangeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSummary = useCallback(async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const data = await fetchSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const refresh = useCallback(() => {
    return loadSummary(true);
  }, [loadSummary]);

  return { summary, isLoading, isRefreshing, error, refresh };
}
