"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import AdminNav from "@/components/admin/AdminNav";
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
      <main
        className="
          relative min-h-screen
          bg-background
        "
      >
        {/* Ambient violet glow */}
        <div
          aria-hidden
          className="
            pointer-events-none
            absolute inset-0
            bg-ambient
            opacity-40
          "
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-7 flex items-start gap-4">
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                border border-brand-500/30
                bg-brand-500/10
                text-brand-400
                shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
              "
            >
              <UsersIcon className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {t("title")}
              </h1>

              <p className="mt-1 text-sm text-muted">
                {t("subtitle")}
              </p>
            </div>
          </header>

          {/* Toast */}
          {toast && (
            <div
              role="status"
              className={[
                "mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
                toast.kind === "success"
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-danger/30 bg-danger/10 text-danger",
              ].join(" ")}
            >
              <span>{toast.message}</span>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <UsersTableSkeleton />
          ) : error ? (
            <div
              role="alert"
              className="
                flex items-start gap-3
                rounded-xl
                border border-danger/30
                bg-danger/10
                px-4 py-3
                text-sm text-danger
                shadow-[0_0_20px_rgb(239_68_68_/_0.06)]
              "
            >
              <span>{error}</span>
            </div>
          ) : isEmpty ? (
            <div
              className="
                rounded-2xl
                border border-border
                bg-surface/40
                px-6 py-12
                text-center
                text-sm text-muted
                backdrop-blur-xl
              "
            >
              {t("empty")}
            </div>
          ) : (
            <UsersTable
              users={users}
              onUserUpdated={(updatedUser) => {
                setUsers((currentUsers) =>
                  currentUsers.map((user) =>
                    user.id === updatedUser.id ? updatedUser : user,
                  ),
                );
                showToast("success", t("toastUpdated"));
              }}
              onUserDeleted={(userId) => {
                setUsers((currentUsers) =>
                  currentUsers.filter((user) => user.id !== userId),
                );
                showToast("success", t("toastDeleted"));
              }}
              onError={(message) => showToast("error", message)}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default Users;

// ============================================================
// Loading skeleton
// ============================================================

function UsersTableSkeleton() {
  return (
    <div
      className="
        relative overflow-hidden
        rounded-2xl
        border border-border
        bg-surface/40
        shadow-2xl shadow-black/20
        backdrop-blur-xl
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
          via-brand-500/50
          to-transparent
          shadow-[0_0_14px_rgb(139_92_246_/_0.35)]
        "
      />

      <div className="divide-y divide-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5"
          >
            <div className="h-3 w-6 animate-pulse rounded bg-surface-hover" />
            <div className="h-3 w-40 animate-pulse rounded bg-surface-hover" />
            <div className="h-3 w-28 animate-pulse rounded bg-surface-hover" />
            <div className="ml-auto h-6 w-11 animate-pulse rounded-full bg-surface-hover" />
          </div>
        ))}
      </div>
    </div>
  );
}