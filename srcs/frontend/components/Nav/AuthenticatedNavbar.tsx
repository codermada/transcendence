"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/icons";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NavTabs } from "./NavTabs";
import { UserDropdown } from "./UserDropdown";

export function AuthenticatedNavbar() {
  const t = useTranslations("Nav");

  return (
    <header
      className="
        fixed inset-x-0 top-0 z-40 h-14
        border-b border-zinc-200/80 bg-white/85 text-zinc-900 backdrop-blur-md
        transition-colors
        dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:text-white
      "
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-3 sm:px-6">
        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          <Link
            href="/feed"
            className="flex items-center gap-2 rounded-lg p-1 font-bold tracking-tight text-zinc-900 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-violet-500/40 dark:text-white"
            aria-label="Heartbeat Feed"
          >
            <Logo className="h-6 w-6 text-violet-600 dark:text-violet-500" />
            <span className="hidden text-lg font-bold sm:inline">
              {t("brand")}
              <span className="text-violet-600 dark:text-violet-500">
                {t("brandAccent")}
              </span>
            </span>
          </Link>
        </div>

        <div className="hidden h-full items-center justify-center md:flex">
          <NavTabs />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}