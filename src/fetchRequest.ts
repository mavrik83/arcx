import { globalConfig } from "./config";

/**
 * Additional fetch options specific to ArcX.
 */
export type FetchOptions = RequestInit & {
  /** A record of query parameters to be appended to the request URL. */
  queryParams?: Record<string, string | number | boolean>;

  /** Timeout in milliseconds after which the request will be aborted. */
  timeout?: number;

  /** Number of times to retry the request in case of network errors. */
  retries?: number;
};

/**
 * Delays execution for a specified number of milliseconds.
 * @param ms - The number of milliseconds to delay.
 * @returns A promise that resolves after the specified delay.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely converts various `HeadersInit` forms into a `Record<string, string>`.
 * - Headers: Iterate and build a record.
 * - string[][]: Convert array of [key, value] pairs to a record.
 * - Record<string, string>: Already a record, just return it.
 *
 * @param headersInit - The headers to be converted.
 * @returns A `Record<string, string>` or `undefined` if no headers provided.
 */
function toRecord(
  headersInit?: HeadersInit
): Record<string, string> | undefined {
  if (!headersInit) return undefined;

  if (headersInit instanceof Headers) {
    const result: Record<string, string> = {};
    headersInit.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  } else if (Array.isArray(headersInit)) {
    const result: Record<string, string> = {};
    for (const [key, value] of headersInit) {
      result[key] = value;
    }
    return result;
  } else {
    // It's already a Record<string, string>
    return headersInit;
  }
}

/**
 * Merges multiple header objects into one, giving precedence
 * to headers from later objects in case of conflicts.
 *
 * @param headerObjects - An array of header objects to merge.
 * @returns A merged record of headers.
 */
function mergeHeaders(
  ...headerObjects: (Record<string, string> | undefined)[]
): Record<string, string> {
  return headerObjects.reduce<Record<string, string>>((acc, obj) => {
    if (!obj) return acc;
    for (const [key, value] of Object.entries(obj)) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

/**
 * Performs a fetch request with retries, timeouts, and interceptors.
 *
 * @template T - The expected shape of the JSON response.
 * @param url - The endpoint or path for the request.
 * @param options - Additional request options.
 * @returns A promise resolving to the parsed JSON response of type `T`.
 */
export async function fetchRequest<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  // Determine final URL (prepend global baseUrl if provided).
  let finalUrl = globalConfig.baseUrl ? globalConfig.baseUrl + url : url;

  // Serialize query parameters into the URL if provided.
  if (options.queryParams) {
    const params = new URLSearchParams(
      Object.entries(options.queryParams).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    finalUrl += `?${params}`;
  }

  // Extract interceptors and global headers if any
  const {
    interceptors,
    headers: globalHeaders,
    ...globalRequestInit
  } = globalConfig;

  // Convert any HeadersInit to a record.
  const globalHeadersRecord = toRecord(globalHeaders);
  const requestHeadersRecord = toRecord(options.headers);

  // Merge global headers and request headers
  const mergedHeaders = mergeHeaders(globalHeadersRecord, requestHeadersRecord);

  // Construct the final request config.
  const config: RequestInit = {
    ...globalRequestInit,
    ...options,
    headers: mergedHeaders,
  };

  // Invoke onRequest interceptor if available.
  if (interceptors?.onRequest) {
    Object.assign(config, interceptors.onRequest(config));
  }

  // If the body is a plain object, stringify it and set JSON headers.
  if (
    config.body &&
    typeof config.body === "object" &&
    !(config.body instanceof FormData)
  ) {
    config.body = JSON.stringify(config.body);
    config.headers = {
      ...config.headers,
      "Content-Type": "application/json",
    };
  }

  // Setup an AbortController for timeout.
  const controller = new AbortController();
  config.signal = controller.signal;

  if (options.timeout) {
    setTimeout(() => controller.abort(), options.timeout);
  }

  // Handle retries with exponential backoff.
  let attempt = 0;
  const maxRetries = options.retries ?? 0;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(finalUrl, config);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `HTTP error: ${response.status} (${response.statusText}) - ${errorText} [URL: ${finalUrl}]`
        );
      }

      // Parse JSON response.
      let result = (await response.json()) as T;

      // Invoke onResponse interceptor if available.
      if (interceptors?.onResponse) {
        result = await interceptors.onResponse(result);
      }

      return result;
    } catch (error) {
      // Invoke onError interceptor if available.
      if (interceptors?.onError) {
        interceptors.onError(error);
      }

      // If we've reached the maximum retries, throw the error.
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 100ms, 200ms, 400ms, etc.
      attempt++;
      await delay(2 ** attempt * 100);
    }
  }

  throw new Error("Request failed after retries.");
}
