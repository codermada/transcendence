"use client";

import { useTranslations } from "next-intl";
import { Search } from "@/components/icons";

export function FriendRequestSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("FriendRequests");

  return (
    <div className="relative sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
        className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-white dark:placeholder:text-zinc-500"
      />
    </div>
  );
}