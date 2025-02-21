"use client";

import { createContext, useContext, useEffect, PropsWithChildren } from "react";
import { ArcXConfig, configureArcX } from "./config";

/**
 * Context for ArcX configuration in React.
 */
export const ArcXContext = createContext<ArcXConfig | null>(null);

/**
 * A React provider component that automatically calls `configureArcX`
 * with the props you pass in. Ideal for Next.js or React applications.
 *
 * @param props - ArcXConfig plus children for the provider.
 */
export function ArcXProvider({
  children,
  ...config
}: PropsWithChildren<ArcXConfig>) {
  useEffect(() => {
    // Merge the passed config into the globalConfig
    configureArcX(config);
  }, [config]);

  return <ArcXContext.Provider value={config}>{children}</ArcXContext.Provider>;
}

/**
 * A convenience hook to retrieve ArcX's config from context, if needed.
 */
export function useArcX(): ArcXConfig {
  const ctx = useContext(ArcXContext);
  if (!ctx) {
    throw new Error("useArcX must be used within an ArcXProvider.");
  }
  return ctx;
}
