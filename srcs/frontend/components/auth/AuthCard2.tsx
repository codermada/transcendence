import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthCard2({ title, subtitle, footer, children }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-lg shadow-brand/5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
          )}
        </div>

        <div className="mt-8">{children}</div>

        {footer && (
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        )}
      </div>
    </main>
  );
}