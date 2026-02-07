"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

/**
 * Theme Provider Component
 *
 * Wraps the application with next-themes provider to enable dark/light mode switching
 * Uses React 19 features and proper TypeScript typing
 *
 * @param children - Child components to wrap
 * @param props - Theme provider configuration props
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
