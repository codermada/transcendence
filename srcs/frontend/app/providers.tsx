'use client'

import { ThemeProvider } from '@teispace/next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storage="local" // Add this if you want the old behavior
        >
        {children}
    </ThemeProvider>
  )
}