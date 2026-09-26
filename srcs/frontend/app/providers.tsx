"use client";

import { ThemeProvider as NextThemesProvider } from "@teispace/next-themes";

// Suppress extension-induced hydration warnings in development
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (
      msg.includes("Hydration failed") ||
      msg.includes("hydrated but some attributes") ||
      msg.includes("did not match the client properties") ||
      msg.includes("cz-shortcut-listen") ||
      msg.includes("suppressHydrationWarning")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}