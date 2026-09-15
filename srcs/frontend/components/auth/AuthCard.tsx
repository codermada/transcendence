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
    <main className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Blurred background */}
      <div className="absolute inset-0 scale-110 bg-gradient-to-br from-violet-900/40 via-zinc-950 to-fuchsia-900/30 blur-2xl" />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Auth card container */}
      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/90 p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
          </div>

          {/* Form Content */}
          {children}

          {/* Footer */}
          {footer && <div className="mt-6 text-center text-sm text-zinc-500">{footer}</div>}
        </div>
      </div>
    </main>
  );
}
