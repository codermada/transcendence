"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type CurrentUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export function ProfileCard() {
  const t = useTranslations("Profile");

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/nest/user/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (cancelled) return;

        if (!res.ok) {
          toast.error(t("errorUnexpected"));
          return;
        }

        const data: CurrentUser = await res.json();
        setUser(data);
      } catch {
        if (!cancelled) toast.error(t("errorUnexpected"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/40 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 animate-pulse rounded-full bg-surface-hover" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-40 animate-pulse rounded bg-surface-hover" />
            <div className="h-4 w-56 animate-pulse rounded bg-surface-hover" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-surface/40 p-10 text-center backdrop-blur-xl">
        <p className="text-sm text-muted">{t("errorUnexpected")}</p>
      </div>
    );
  }

  const displayName = user.name?.trim() || t("unnamed");
  const initials = getInitials(displayName);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/40 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent shadow-[0_0_14px_rgb(139_92_246_/_0.35)]"
      />

      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Avatar src={user.image} initials={initials} alt={displayName} />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold text-foreground">
            {displayName}
          </h2>
          <p className="mt-1 truncate text-sm text-muted">{user.email}</p>
        </div>

        <Link href="/settings/profile" className="btn-secondary shrink-0">
          {t("edit")}
        </Link>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2">
        <MetaRow label={t("idLabel")} value={user.id} mono />
        <MetaRow label={t("emailLabel")} value={user.email} />
      </dl>
    </div>
  );
}

function Avatar({
  src,
  initials,
  alt,
}: {
  src: string | null;
  initials: string;
  alt: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-border"
      />
    );
  }

  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-600/15 text-lg font-semibold text-brand-400 ring-1 ring-border">
      {initials}
    </div>
  );
}

function MetaRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd
        className={`mt-1 truncate text-sm text-foreground ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}