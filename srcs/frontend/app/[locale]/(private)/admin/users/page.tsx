"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import UsersTable, { type User } from "@/components/admin/UsersTable";
import { Users as UsersIcon } from "@/components/icons";

type Toast = { kind: "success" | "error"; message: string } | null;

const Users = () => {
  const t = useTranslations("Admin.users");

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const showToast = useCallback(
    (kind: "success" | "error", message: string) => {
      setToast({ kind, message });
      window.setTimeout(() => setToast(null), 4000);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function getUsers() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/nest/user", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(t("errorFailed"));
        }

        const data = await response.json();

        if (!cancelled) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : t("errorUnexpected"),
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    getUsers();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const isEmpty = !isLoading && !error && users.length === 0;

  return (
    <>
      <header className="mb-7 flex items-start gap-4">
        <div
          className="
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-xl
            border border-violet-500/30
            bg-violet-50 text-violet-600
            shadow-sm transition-colors
            dark:bg-violet-500/10 dark:text-violet-400
            dark:shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
          "
        >
          <UsersIcon className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("title")}
          </h1>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("subtitle")}
          </p>
        </div>
      </header>

      {toast && (
        <div
          role="status"
          className={[
            "mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
            toast.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
          ].join(" ")}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {isLoading ? (
        <UsersTableSkeleton />
      ) : error ? (
        <div
          role="alert"
          className="
            flex items-start gap-3
            rounded-xl
            border border-red-200 bg-red-50 px-4 py-3
            text-sm text-red-800 transition-colors
            dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400
            dark:shadow-[0_0_20px_rgb(239_68_68_/_0.06)]
          "
        >
          <span>{error}</span>
        </div>
      ) : isEmpty ? (
        <div
          className="
            rounded-2xl border border-zinc-200/80 bg-white/80
            px-6 py-12 text-center text-sm text-zinc-500
            shadow-xl transition-colors backdrop-blur-xl
            dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-zinc-400
          "
        >
          {t("empty")}
        </div>
      ) : (
        <UsersTable
          users={users}
        />
      )}
    </>
  );
};

export default Users;

function UsersTableSkeleton() {
  return (
    <div
      className="
        relative overflow-hidden
        rounded-2xl
        border border-zinc-200/80
        bg-white/80
        shadow-xl backdrop-blur-xl
        transition-colors
        dark:border-zinc-800/80
        dark:bg-zinc-900/50
        dark:shadow-2xl dark:shadow-black/20
      "
    >
      <div
        aria-hidden
        className="
          pointer-events-none
          absolute inset-x-10 top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-violet-500/50
          to-transparent
          shadow-[0_0_14px_rgb(139_92_246_/_0.35)]
        "
      />

      <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5"
          >
            <div className="h-3 w-6 animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800" />
            <div className="h-3 w-40 animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800" />
            <div className="h-3 w-28 animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800" />
            <div className="ml-auto h-6 w-11 animate-pulse rounded-full bg-zinc-200/70 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}