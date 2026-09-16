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
    <main className="min-h-dvh bg-background text-foreground">

      <div className={`mx-auto ${maxWidth} p-6`}>
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-muted">{subtitle}</p>
          )}
        </header>

        {children}
      </div>
    </main>
  );
}