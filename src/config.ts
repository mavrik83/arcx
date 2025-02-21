/**
 * @module config
 * Contains global configuration types, defaults, and
 * a function to merge user-defined config.
 */

/**
 * Represents a set of interceptors for ArcX.
 *
 * @template ResponseType - Generic type for the intercepted response.
 */
export interface ArcXInterceptors<ResponseType = unknown> {
  /**
   * Modify or replace the outgoing `RequestInit` before the fetch is made.
   */
  onRequest?: (config: RequestInit) => RequestInit;

  /**
   * Modify or replace the response (ResponseType) before returning it.
   * Must return the same type (ResponseType) or a promise resolving to that type.
   */
  onResponse?: (response: ResponseType) => ResponseType | Promise<ResponseType>;

  /**
   * Handle any error (HTTP, network, or otherwise) caught during the request.
   */
  onError?: (error: unknown) => void;
}

/**
 * Represents the global configuration options for ArcX, including:
 * - baseUrl: Prepended to all request paths
 * - headers: Default headers
 * - interceptors: Hooks for modifying requests/responses/errors
 *
 * @template ResponseType - The type shape expected for responses.
 */
export interface ArcXConfig<ResponseType = unknown> extends RequestInit {
  /**
   * Base URL to prefix all requests with.
   * Example: https://api.example.com
   */
  baseUrl?: string;

  /**
   * Default headers to be applied to all requests.
   */
  headers?: Record<string, string>;

  /**
   * Interceptors for modifying requests, handling responses, and errors.
   */
  interceptors?: ArcXInterceptors<ResponseType>;
}

/**
 * Global configuration object, which can be updated via `configureArcX`.
 * Includes default values for convenience.
 */
export const globalConfig: ArcXConfig<unknown> = {
  baseUrl: "",
  headers: {},
  interceptors: {},
};

/**
 * Merges user-defined config into the global config. The generic type <T> ensures
 * that if you have a consistent response shape for global interceptors, you can
 * annotate it here. For most cases, using the default <unknown> is sufficient.
 *
 * @param config - Partial configuration to be merged with the global configuration.
 */
export function configureArcX<T = unknown>(config: ArcXConfig<T>): void {
  Object.assign(globalConfig, config);
}
