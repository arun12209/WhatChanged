import { useState, useEffect, useCallback } from 'react';
import { Insights } from '../domain/types';
import { fetchInsights } from '../data/whatChangedApi';

export function useInsights(range = '7d') {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadInsights = useCallback(async (r?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchInsights(r || range);
      setInsights(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return { insights, isLoading, error, refresh: loadInsights };
}
