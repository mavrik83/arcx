/**
 * Represents the global configuration options for ArcX.
 */
export type ArcXConfig = {
  /** Base URL to prefix all requests with. */
  baseUrl?: string;

  /** Default headers to be applied to all requests. */
  headers?: Record<string, string>;

  /**
   * Interceptors for modifying request and handling response/error.
   * - onRequest: Allows modifying the `RequestInit` before the request is sent.
   * - onResponse: Allows processing the response before returning it.
   * - onError: Allows handling errors globally.
   */
  interceptors?: {
    onRequest?: (config: RequestInit) => RequestInit;
    onResponse?: <T>(response: T) => T | Promise<T>;
    onError?: (error: unknown) => void;
  };
};

/**
 * Stores the global configuration for ArcX. Can be updated via `configureArcX`.
 */
export const globalConfig: ArcXConfig = {};

/**
 * Merges the user-defined config into the globalConfig.
 * @param config - Partial configuration to be merged with the global configuration.
 */
export const configureArcX = (config: ArcXConfig): void => {
  Object.assign(globalConfig, config);
};
