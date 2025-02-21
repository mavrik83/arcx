import { fetchRequest, FetchOptions } from "./fetchRequest";

/**
 * A minimal Suspense-compatible hook that throws a promise until data is loaded,
 * or throws an error if there's a failure.
 *
 * @template T - The expected shape of the fetched data.
 * @param url - The resource URL.
 * @param options - Additional fetch options.
 * @returns The fetched data of type T.
 *
 * @example
 * function MyComponent() {
 *   const data = useFetchSuspense<MyData>("/api/data");
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 *
 * // Then wrap <MyComponent /> in a <Suspense fallback={...} /> boundary
 */
export function useFetchSuspense<T>(url: string, options?: FetchOptions): T {
  let result: T | undefined;
  let error: unknown;

  const promise = fetchRequest<T>(url, options).then(
    (res) => {
      result = res;
    },
    (err) => {
      error = err;
    }
  );

  // If there's an error, throw immediately
  if (error) {
    throw error;
  }

  // If result is not yet set, throw the promise to trigger Suspense fallback
  if (result === undefined) {
    throw promise;
  }

  // Otherwise, we have data
  return result;
}
