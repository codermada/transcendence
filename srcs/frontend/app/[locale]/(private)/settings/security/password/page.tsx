"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronLeft } from "@/components/icons";

import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";

export default function ChangePasswordPage() {
  const t = useTranslations("Settings.security.password");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/settings/security"
          className="
            inline-flex items-center gap-1 text-xs font-medium
            text-zinc-500 transition-colors
            hover:text-violet-600
            dark:text-zinc-400 dark:hover:text-violet-400
          "
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {t("back")}
        </Link>
      </div>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>
      </header>

      <div
        className="
          rounded-2xl border p-5 sm:p-6
          border-zinc-200/80 bg-white shadow-xs
          dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none
        "
      >
        <ChangePasswordForm />
      </div>
    </div>
  );
}