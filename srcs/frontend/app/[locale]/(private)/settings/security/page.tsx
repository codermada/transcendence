"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

import { ShieldCheck, ChevronRight } from "@/components/icons";

export default function SecuritySettingsPage() {
  const t = useTranslations("Settings.security");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      </header>

      {/* ===== Two-Factor Authentication — links to dedicated page ===== */}
      <Link
        href="/settings/security/two-factor"
        className="
          group relative block
          overflow-hidden
          rounded-2xl
          border border-brand-500/20
          bg-brand-500/[0.04]
          p-5
          transition-colors
          hover:border-brand-500/40
          focus:outline-none
          focus:ring-2
          focus:ring-brand-500/20
          sm:p-6
        "
      >
        <div
          aria-hidden
          className="
            pointer-events-none
            absolute inset-0
            bg-ambient
            opacity-40
          "
        />

        <div className="relative flex items-start gap-4">
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              border border-brand-500/30
              bg-brand-500/10
              text-brand-400
              shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
              transition-colors
              group-hover:border-brand-500/50
              group-hover:bg-brand-500/15
            "
          >
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                {t("twoFactor.title")}
              </h2>
            </div>

            <p className="mt-1 text-xs leading-relaxed text-muted">
              {t("twoFactor.description")}
            </p>
          </div>

          <ChevronRight
            className="
              mt-2 h-4 w-4 shrink-0
              text-muted
              transition-all
              group-hover:translate-x-0.5
              group-hover:text-brand-400
            "
          />
        </div>
      </Link>

      {/* ===== Placeholders ===== */}
      <section className="space-y-3">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted">
          {t("moreTitle")}
        </h2>

        <PlaceholderCard
          title={t("password.title")}
          description={t("password.description")}
          comingSoon={t("comingSoon")}
        />

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

// ============================================================
// Placeholder card
// ============================================================

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
        relative overflow-hidden
        rounded-2xl
        border
        bg-surface/40
        p-5
        shadow-2xl
        shadow-black/20
        backdrop-blur-xl
        ${
          danger
            ? "border-danger/20"
            : "border-border"
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-sm font-semibold ${
                danger ? "text-danger" : "text-foreground"
              }`}
            >
              {title}
            </h3>

            <span
              className="
                inline-flex items-center
                rounded-full
                border border-border
                bg-surface
                px-2.5 py-0.5
                text-[10px] font-medium uppercase tracking-wider
                text-muted
              "
            >
              {comingSoon}
            </span>
          </div>

          <p className="mt-1 text-xs leading-relaxed text-muted">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}