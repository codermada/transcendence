"use client";

import { useTranslations } from "next-intl";
import type { Tab } from "./types";

function EmptyIcon() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-violet-600 ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:text-violet-400/70 dark:ring-zinc-800">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
        aria-hidden
      >
        <path d="M3 8l9 6 9-6" />
        <rect x="3" y="5" width="18" height="14" rx="2" />
      </svg>
    </div>
  );
}

export function FriendRequestEmpty({
  tab,
  isSearching,
  variant = "empty",
}: {
  tab: Tab;
  isSearching: boolean;
  variant?: "empty" | "error";
}) {
  const t = useTranslations("FriendRequests");

  const title =
    variant === "error"
      ? t("loadError")
      : isSearching
        ? t("empty.searchTitle")
        : tab === "incoming"
          ? t("empty.incomingTitle")
          : t("empty.outgoingTitle");

  const description =
    variant === "error"
      ? t("loadErrorHint")
      : isSearching
        ? t("empty.searchDescription")
        : tab === "incoming"
          ? t("empty.incomingDescription")
          : t("empty.outgoingDescription");

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-10 text-center shadow-xs backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none">
      <EmptyIcon />
      <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}