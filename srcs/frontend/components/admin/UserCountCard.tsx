"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Users } from "@/components/icons";

export function UserCountCard() {
  const t = useTranslations("Admin.dashboard");
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/nest/user/count", {
          credentials: "include",
        });

        if (!res.ok) return;

        const data = (await res.json()) as { count: number };
        if (!cancelled) setCount(data.count);
      } catch {
        // leave count as null
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="
        relative overflow-hidden
        rounded-2xl border border-zinc-200
        bg-white p-6
        shadow-sm
        dark:border-zinc-800 dark:bg-zinc-900
        sm:p-8
      "
    >
      <div className="flex items-center gap-5 sm:gap-6">
        <div
          className="
            flex h-14 w-14 shrink-0
            items-center justify-center
            rounded-2xl
            border border-violet-500/30
            bg-violet-50 text-violet-600
            dark:bg-violet-500/10 dark:text-violet-400
            sm:h-16 sm:w-16
          "
        >
          <Users className="h-7 w-7 sm:h-8 sm:w-8" />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 sm:text-sm">
            {t("totalUsers")}
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            {isLoading ? (
              <span className="inline-block h-10 w-24 animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800 sm:h-12" />
            ) : (
              (count ?? 0).toLocaleString()
            )}
          </p>
        </div>
      </div>

      <div
        aria-hidden
        className="
          pointer-events-none absolute -right-16 -top-16
          h-48 w-48 rounded-full
          bg-violet-500/10 blur-3xl
          dark:bg-violet-500/20
        "
      />
    </section>
  );
}