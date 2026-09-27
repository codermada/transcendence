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
            border-brand-500/30 bg-brand-500/10 text-brand-400
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-xl
            border
            shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
            transition-colors
          "
        >
          <UsersIcon className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>

          <p className="text-muted mt-1 text-sm">
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
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger",
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
            border-danger/30 bg-danger/10 text-danger
            flex items-start gap-3
            rounded-xl border px-4 py-3
            text-sm transition-colors
            shadow-[0_0_20px_rgb(239_68_68_/_0.06)]
          "
        >
          <span>{error}</span>
        </div>
      ) : isEmpty ? (
        <div
          className="
            border-border/80 bg-surface/50 text-muted
            rounded-2xl border
            px-6 py-12 text-center text-sm
            shadow-xl backdrop-blur-xl transition-colors
          "
        >
          {t("empty")}
        </div>
      ) : (
        <UsersTable users={users} />
      )}
    </>
  );
};

export default Users;

function UsersTableSkeleton() {
  return (
    <div
      className="
        border-border/80 bg-surface/50
        relative overflow-hidden
        rounded-2xl border
        shadow-2xl shadow-black/20 backdrop-blur-xl
        transition-colors
      "
    >
      <div
        aria-hidden
        className="
          from-transparent via-brand-500/50 to-transparent
          pointer-events-none
          absolute inset-x-10 top-0
          h-px
          bg-gradient-to-r
          shadow-[0_0_14px_rgb(139_92_246_/_0.35)]
        "
      />

      <div className="divide-border/80 divide-y">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <div className="bg-border animate-pulse h-3 w-6 rounded" />
            <div className="bg-border animate-pulse h-3 w-40 rounded" />
            <div className="bg-border animate-pulse h-3 w-28 rounded" />
            <div className="bg-border animate-pulse ml-auto h-6 w-11 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}