import { ArcXConfig, globalConfig } from "./config";
import { HTTPError, NetworkError } from "./errors";

/**
 * Possible response parse methods.
 */
export type ParseType = "json" | "text" | "blob" | "arrayBuffer";

/** Additional ArcX-specific options. */
export interface FetchOptions extends RequestInit {
  queryParams?: Record<string, string | number | boolean>;
  timeout?: number;
  retries?: number;
  parseAs?: ParseType;
}

/** A small delay utility for retries. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Unified parse for various response types.
 * Forces the result to type `T` after parsing.
 */
async function parseResponse<T>(
  response: Response,
  parseAs: ParseType
): Promise<T> {
  let parsed: unknown;
  switch (parseAs) {
    case "text":
      parsed = await response.text();
      break;
    case "blob":
      parsed = await response.blob();
      break;
    case "arrayBuffer":
      parsed = await response.arrayBuffer();
      break;
    case "json":
    default:
      parsed = await response.json();
  }
  return parsed as T;
}

/** Convert `HeadersInit` to a `Record<string, string>` if possible. */
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
    for (const [k, v] of headersInit) {
      result[k] = v;
    }
    return result;
  } else {
    // It's already a record
    return headersInit;
  }
}

/**
 * Merges multiple header objects into one, giving precedence
 * to headers from later objects in case of conflicts.
 */
function mergeHeaders(
  ...headerObjects: (Record<string, string> | undefined)[]
): Record<string, string> {
  return headerObjects.reduce<Record<string, string>>((acc, obj) => {
    if (!obj) return acc;
    for (const [k, v] of Object.entries(obj)) {
      acc[k] = v;
    }
    return acc;
  }, {} as Record<string, string>);
}

/**
 * A typed fetch request with retries, timeouts, interceptors, etc.
 *
 * @template T - The shape of the final parsed response.
 * @param url - Endpoint path
 * @param options - Additional ArcX fetch options
 */
export async function fetchRequest<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  // Combine config from global + user options
  const {
    interceptors,
    headers: globalHeaders,
    ...globalRequestInit
  } = globalConfig as ArcXConfig<T>;

  // Build final URL (including optional query params)
  let finalUrl = globalConfig.baseUrl ? globalConfig.baseUrl + url : url;
  if (options.queryParams) {
    const params = new URLSearchParams(
      Object.entries(options.queryParams).reduce((acc, [key, val]) => {
        acc[key] = String(val);
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    finalUrl += `?${params}`;
  }

  // Merge headers
  const mergedHeaders = mergeHeaders(
    toRecord(globalHeaders),
    toRecord(options.headers)
  );

  // Construct final RequestInit
  const config: RequestInit = {
    ...globalRequestInit,
    ...options,
    headers: mergedHeaders,
  };

  // onRequest interceptor
  if (interceptors?.onRequest) {
    Object.assign(config, interceptors.onRequest(config));
  }

  // If body is a plain object, JSONify it
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

  // Timeout with AbortController
  const controller = new AbortController();
  config.signal = controller.signal;
  if (options.timeout) {
    setTimeout(() => controller.abort(), options.timeout);
  }

  // Handling retries
  let attempt = 0;
  const maxRetries = options.retries ?? 0;
  const parseType = options.parseAs ?? "json";

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(finalUrl, config);

      if (!response.ok) {
        const responseBody = await response.text().catch(() => "Unknown error");
        throw new HTTPError(
          `HTTP Error: ${response.status} (${response.statusText}) [URL: ${finalUrl}]`,
          response.status,
          responseBody
        );
      }

      // Parse according to parseType
      let result = await parseResponse<T>(response, parseType);

      // onResponse interceptor must return T or Promise<T>
      if (interceptors?.onResponse) {
        result = await interceptors.onResponse(result);
      }

      return result;
    } catch (error) {
      // onError interceptor
      if (interceptors?.onError) {
        interceptors.onError(error);
      }

      // If final attempt fails, throw
      if (attempt === maxRetries) {
        if (!(error instanceof Error)) {
          throw new NetworkError("Unknown network error occurred.");
        }
        throw error;
      }

      attempt++;
      // Exponential backoff
      await delay(2 ** attempt * 100);
    }
  }

  throw new NetworkError("Request failed after retries.");
}
