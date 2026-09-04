import { useState, useEffect, useRef } from 'react';

/**
 * Polls `fetcher` every `intervalMs` milliseconds and returns the latest
 * result along with live-status metadata. Used to power the "Live" badges.
 *
 * The fetcher is always called with fresh closure values, so `deps` only
 * needs to include values that should restart the polling timer.
 */
export default function usePolling(fetcher, intervalMs = 30000, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let active = true;

    const tick = async () => {
      try {
        const result = await fetcherRef.current();
        if (!active) return;
        setData(result);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    tick();
    const timer = setInterval(tick, intervalMs);

    return () => {
      active = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);

  return { data, loading, error, lastUpdated };
}