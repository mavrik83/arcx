"use client";

/**
 * @module useFetch
 * A React hook for fetching data using `fetchRequest`.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchRequest, FetchOptions } from "./fetchRequest";

/**
 * Extended React-specific options for useFetch.
 */
export interface UseFetchOptions extends FetchOptions {
  /**
   * If `true`, the fetch call will not run on mount.
   * You must call `refetch()` manually.
   */
  manual?: boolean;
}

/**
 * Provides data, loading state, error state, and a `refetch` function for
 * a given URL and options. Uses the ArcX fetchRequest under the hood.
 *
 * @template T - The expected shape of the fetched data.
 * @param url - The endpoint or path for the request.
 * @param options - Additional ArcX/React options (manual, etc.).
 */
export function useFetch<T>(url: string, options?: UseFetchOptions) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchRequest<T>(url, options ?? {});
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (!options?.manual) {
      void fetchData();
    }
  }, [fetchData, options?.manual]);

  return { data, isLoading, error, refetch: fetchData };
}
