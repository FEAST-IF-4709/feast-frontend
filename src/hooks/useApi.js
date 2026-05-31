import { useState, useEffect, useCallback } from 'react';
import { handleApiError } from '../api/errorHandler';

export function useApi(apiCall, deps = [], options = {}) {
  const { onSuccess, onError, immediate = true } = options;
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiCall();
      const payload = res.data?.data ?? res.data;
      setData(payload);
      if (onSuccess) onSuccess(payload);
      return payload;
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      } else {
        handleApiError(err);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  // deps passed from caller — generic hook, static analysis not applicable
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (immediate) fetch();
  }, [fetch, immediate]);

  return { data, isLoading, error, refetch: fetch };
}
