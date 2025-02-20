export type ArcXConfig = {
  baseUrl?: string;
  headers?: Record<string, string>;
  interceptors?: {
    onRequest?: (config: RequestInit) => RequestInit;
    onResponse?: <T>(response: T) => T;
    onError?: (error: any) => void;
  };
};

export const globalConfig: ArcXConfig = {};

export const configureArcX = (config: ArcXConfig) => {
  Object.assign(globalConfig, config);
};
