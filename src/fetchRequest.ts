import { globalConfig } from "./config";

export type FetchOptions = RequestInit & {
  queryParams?: Record<string, string | number | boolean>;
  timeout?: number;
  retries?: number;
};

export async function fetchRequest<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  let finalUrl = globalConfig.baseUrl ? globalConfig.baseUrl + url : url;

  if (options.queryParams) {
    const params = new URLSearchParams(
      options.queryParams as Record<string, string>
    ).toString();
    finalUrl += `?${params}`;
  }

  const config = { ...globalConfig, ...options };

  if (globalConfig.interceptors?.onRequest) {
    Object.assign(config, globalConfig.interceptors.onRequest(config));
  }

  const controller = new AbortController();
  config.signal = controller.signal;

  if (options.timeout) {
    setTimeout(() => controller.abort(), options.timeout);
  }

  let attempt = 0;
  while (attempt <= (options.retries ?? 0)) {
    try {
      const response = await fetch(finalUrl, config);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      let result = (await response.json()) as T;

      if (globalConfig.interceptors?.onResponse) {
        result = globalConfig.interceptors.onResponse(result);
      }

      return result;
    } catch (error) {
      if (globalConfig.interceptors?.onError)
        globalConfig.interceptors.onError(error);
      if (attempt === (options.retries ?? 0)) throw error;
      attempt++;
    }
  }

  throw new Error("Request failed after retries");
}
