"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

import { ShieldCheck, ChevronRight, KeyRound } from "@/components/icons";

export default function SecuritySettingsPage() {
  const t = useTranslations("Settings.security");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>
      </header>

      {/* Two-Factor Authentication */}
      <Link
        href="/settings/security/two-factor"
        className="
          group relative block
          overflow-hidden
          rounded-2xl
          border border-violet-200/80 bg-violet-50/50 p-5 shadow-xs transition-all
          hover:border-violet-300 hover:bg-violet-50
          dark:border-violet-500/20 dark:bg-violet-500/[0.04] dark:p-5 dark:shadow-none
          dark:hover:border-violet-500/40 dark:hover:bg-violet-500/[0.08]
          focus:outline-none focus:ring-2 focus:ring-violet-500/20
          sm:p-6
        "
      >
        <div
          aria-hidden
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-r from-violet-200/20 via-transparent to-transparent
            opacity-60 dark:opacity-40
          "
        />

        <div className="relative flex items-start gap-4">
          <div
            className="
              flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
              border border-violet-200 bg-violet-100 text-violet-700
              shadow-xs transition-colors
              group-hover:border-violet-300 group-hover:bg-violet-200
              dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400
              dark:shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
              dark:group-hover:border-violet-500/50 dark:group-hover:bg-violet-500/15
            "
          >
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {t("twoFactor.title")}
              </h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t("twoFactor.description")}
            </p>
          </div>

          <ChevronRight
            className="
              mt-2 h-4 w-4 shrink-0 text-zinc-400 transition-all
              group-hover:translate-x-0.5 group-hover:text-violet-600
              dark:text-zinc-500 dark:group-hover:text-violet-400
            "
          />
        </div>
      </Link>

      {/* Password */}
      <Link
        href="/settings/security/password"
        className="
          group relative block
          overflow-hidden
          rounded-2xl
          border border-violet-200/80 bg-violet-50/50 p-5 shadow-xs transition-all
          hover:border-violet-300 hover:bg-violet-50
          dark:border-violet-500/20 dark:bg-violet-500/[0.04] dark:p-5 dark:shadow-none
          dark:hover:border-violet-500/40 dark:hover:bg-violet-500/[0.08]
          focus:outline-none focus:ring-2 focus:ring-violet-500/20
          sm:p-6
        "
      >
        <div
          aria-hidden
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-r from-violet-200/20 via-transparent to-transparent
            opacity-60 dark:opacity-40
          "
        />

        <div className="relative flex items-start gap-4">
          <div
            className="
              flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
              border border-violet-200 bg-violet-100 text-violet-700
              shadow-xs transition-colors
              group-hover:border-violet-300 group-hover:bg-violet-200
              dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400
              dark:shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
              dark:group-hover:border-violet-500/50 dark:group-hover:bg-violet-500/15
            "
          >
            <KeyRound className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {t("password.title")}
              </h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t("password.description")}
            </p>
          </div>

          <ChevronRight
            className="
              mt-2 h-4 w-4 shrink-0 text-zinc-400 transition-all
              group-hover:translate-x-0.5 group-hover:text-violet-600
              dark:text-zinc-500 dark:group-hover:text-violet-400
            "
          />
        </div>
      </Link>

      {/* Placeholders */}
      <section className="space-y-3">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {t("moreTitle")}
        </h2>

        <PlaceholderCard
          title={t("sessions.title")}
          description={t("sessions.description")}
          comingSoon={t("comingSoon")}
        />

        <PlaceholderCard
          title={t("danger.title")}
          description={t("danger.description")}
          comingSoon={t("comingSoon")}
          danger
        />
      </section>
    </div>
  );
}

function PlaceholderCard({
  title,
  description,
  comingSoon,
  danger = false,
}: {
  title: string;
  description: string;
  comingSoon: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border p-5 transition-colors
        ${
          danger
            ? "border-rose-200/80 bg-rose-50/40 dark:border-rose-500/20 dark:bg-rose-950/10"
            : "border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none"
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-sm font-semibold ${
                danger
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-zinc-900 dark:text-white"
              }`}
            >
              {title}
            </h3>

            <span
              className={`
                inline-flex items-center rounded-full border px-2.5 py-0.5
                text-[10px] font-medium uppercase tracking-wider
                ${
                  danger
                    ? "border-rose-200 bg-rose-100/60 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    : "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-400"
                }
              `}
            >
              {comingSoon}
            </span>
          </div>

          <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}