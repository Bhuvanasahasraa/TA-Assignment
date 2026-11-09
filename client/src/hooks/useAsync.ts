import { useCallback, useEffect, useState } from 'react';

interface AsyncState<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
  reload: () => void;
}

/** Runs `load` on mount (and on `reload`), tracking loading and error state. */
export function useAsync<T>(load: () => Promise<T>): AsyncState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    load()
      .then((result) => !cancelled && setData(result))
      .catch((err: unknown) => !cancelled && setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // `load` is expected to be a stable module-level function, so only `attempt` triggers a refetch.
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { data, error, loading, reload };
}
