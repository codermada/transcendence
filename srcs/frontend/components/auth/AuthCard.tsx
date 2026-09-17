"use client";

import { ReactNode } from "react";

interface AuthCardProps {
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: AuthCardProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
      {/* Blurred background */}
      <div className="absolute inset-0 scale-110 bg-gradient-to-br from-violet-200/50 via-white to-fuchsia-200/40 blur-2xl dark:from-violet-900/40 dark:via-zinc-950 dark:to-fuchsia-900/30" />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm dark:bg-black/60" />

      {/* Auth card container */}
      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white/90 p-8 shadow-xl shadow-zinc-200/50 transition-colors dark:border-zinc-800 dark:bg-zinc-950/90 dark:shadow-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{title}</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          </div>

          {/* Form Content */}
          {children}

          {/* Footer */}
          {footer && <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">{footer}</div>}
        </div>
      </div>
    </main>
  );
}
