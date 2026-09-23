"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils/user-utils";

type CurrentUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

const MAX_AVATAR_BYTES = 50 * 1024 * 1024; // 50 MB — keep in sync with backend
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];

export function ProfileCard() {
  const t = useTranslations("Profile");

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so selecting the same file twice still triggers onChange
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(t("errorAvatarType"));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(t("errorAvatarSize"));
      return;
    }

    setIsUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/nest/user/me/avatar", {
        method: "PATCH",
        credentials: "include",
        body: form,
      });

      if (res.status === 413) {
        toast.error(t("errorAvatarSize"));
        return;
      }

      if (!res.ok) {
        toast.error(t("errorAvatarUpload"));
        return;
      }

      const updated: CurrentUser = await res.json();
      // Cache-bust so the <img> re-fetches the new file
      setUser({
        ...updated,
        image: updated.image ? `${updated.image}?v=${Date.now()}` : null,
      });
      toast.success(t("avatarUpdated"));
    } catch {
      toast.error(t("errorAvatarUpload"));
    } finally {
      setIsUploading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-2xl dark:shadow-black/20">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-10 text-center backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t("errorUnexpected")}
        </p>
      </div>
    );
  }

  const displayName = user.name?.trim() || t("unnamed");
  const initials = getInitials(displayName);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-2xl dark:shadow-black/20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-violet-500/50 to-transparent shadow-[0_0_14px_rgba(139,92,246,0.35)]"
      />

      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="group relative shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 disabled:cursor-wait"
          aria-label={t("changeAvatar")}
        >
          <Avatar src={user.image} initials={initials} alt={displayName} />

          {/* Hover/upload overlay */}
          <span
            className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-xs font-medium text-white transition-opacity ${
              isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {isUploading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              t("changeAvatar")
            )}
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleAvatarChange}
        />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold text-zinc-900 dark:text-white">
            {displayName}
          </h2>
          <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
            {user.email}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/profile/${user.id}`}
            className="rounded-xl border border-zinc-200/80 bg-zinc-100/80 px-3.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200/80 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            {t("viewPublicProfile")}
          </Link>
          <Link
            href="/settings/profile"
            className="rounded-xl border border-zinc-200/80 bg-zinc-100/80 px-3.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200/80 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            {t("edit")}
          </Link>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-zinc-200/80 pt-5 dark:border-zinc-800/80 sm:grid-cols-2">
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
        className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-zinc-200/80 dark:ring-zinc-800"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-violet-100 text-lg font-semibold text-violet-700 ring-1 ring-zinc-200/80 dark:bg-violet-500/15 dark:text-violet-400 dark:ring-zinc-800">
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
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd
        className={`mt-1 truncate text-sm text-zinc-900 dark:text-white ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
