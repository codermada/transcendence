"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function EditProfileButton() {
  const t = useTranslations("Profile");

  return (
    <Link
      href="/settings/profile"
      className="rounded-xl border border-zinc-200/80 bg-zinc-100/80 px-3.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200/80 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      {t("edit")}
    </Link>
  );
}
