import { useEffect, useRef, useState } from 'react';
import { AUTO_REFRESH_INTERVAL_MS } from '../domain/constants';

export function useAutoRefresh(onRefresh: () => Promise<void> | void, intervalMs = AUTO_REFRESH_INTERVAL_MS) {
  const [secondsAgo, setSecondsAgo] = useState(0);
  const lastRefreshRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Increment seconds counter every second
    const secTimer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastRefreshRef.current) / 1000));
    }, 1000);

    // Auto refresh periodic trigger
    const startPolling = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          onRefresh();
          lastRefreshRef.current = Date.now();
          setSecondsAgo(0);
        }
      }, intervalMs);
    };

    startPolling();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastRefreshRef.current;
        if (elapsed > intervalMs) {
          onRefresh();
          lastRefreshRef.current = Date.now();
          setSecondsAgo(0);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(secTimer);
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onRefresh, intervalMs]);

  const markRefreshed = () => {
    lastRefreshRef.current = Date.now();
    setSecondsAgo(0);
  };

  return { secondsAgo, markRefreshed };
}
