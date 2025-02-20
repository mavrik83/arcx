import { useState, useEffect, useCallback } from "react";
import { fetchRequest, FetchOptions } from "./fetchRequest";

export function useFetch<T>(
  url: string,
  options?: FetchOptions & { manual?: boolean }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchRequest<T>(url, options);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (!options?.manual) {
      fetchData();
    }
  }, [fetchData, options?.manual]);

  return { data, isLoading, error, refetch: fetchData };
}
