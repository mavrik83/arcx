import { useState, useEffect, useCallback } from "react";
import { fetchRequest, FetchOptions } from "./fetchRequest";

/**
 * Custom React hook for fetching data using `fetchRequest`.
 *
 * @template T - The expected shape of the JSON response.
 * @param url - The endpoint or path for the request.
 * @param options - Additional request options, plus a `manual` flag.
 * @returns An object containing:
 * - data: The fetched data or null if not yet available.
 * - isLoading: Boolean indicating the loading state.
 * - error: Any error that occurred during the request.
 * - refetch: A function to manually trigger the fetch.
 */
export function useFetch<T>(
  url: string,
  options?: FetchOptions & { manual?: boolean }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches data from the given URL using the provided options.
   */
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
    let isMounted = true;

    if (!options?.manual) {
      fetchData().then(() => {
        if (!isMounted) return;
      });
    }

    return () => {
      isMounted = false;
    };
  }, [fetchData, options?.manual]);

  return { data, isLoading, error, refetch: fetchData };
}
