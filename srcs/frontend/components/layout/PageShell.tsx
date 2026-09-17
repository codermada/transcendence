import { ReactNode } from "react";


interface PageShellProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  /** Optional max-width override, defaults to max-w-4xl */
  maxWidth?: string;
}

export function PageShell({
  title,
  subtitle,
  children,
  maxWidth = "max-w-4xl",
}: PageShellProps) {
  return (
    <main className="min-h-dvh bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
      <div className={`mx-auto ${maxWidth} p-6`}>
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          )}
        </header>

        {children}
      </div>
    </main>
  );
}