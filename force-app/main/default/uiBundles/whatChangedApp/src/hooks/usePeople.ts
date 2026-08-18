import { useState, useEffect, useCallback } from 'react';
import { Contributor } from '../domain/types';
import { fetchPeople } from '../data/whatChangedApi';

export function usePeople(range = '7d') {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPeople = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchPeople(range);
      setContributors(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  return { contributors, isLoading, error, refresh: loadPeople };
}
