"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth/use-session";
import { Logo, Search } from "@/components/icons";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NavTabs } from "./NavTabs";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { UserDropdown } from "./UserDropdown";

export function AuthenticatedNavbar() {
  const t = useTranslations("Nav");
  const { data: session } = useSession();

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
        {/* ============================================================ */}
        {/* Left Section: Brand & Quick Search */}
        {/* ============================================================ */}
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

          {/* Search Pill Input */}
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="
                h-9 w-36 rounded-full
                border border-zinc-200 bg-zinc-100/80 pl-9 pr-3
                text-xs text-zinc-900 placeholder-zinc-400
                transition-all duration-150
                focus:border-violet-500/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500/80
                dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-white dark:placeholder-zinc-500
                dark:focus:bg-zinc-900
                sm:w-48 sm:pr-10 lg:w-64
              "
            />
            <kbd className="pointer-events-none absolute right-2.5 hidden items-center rounded border border-zinc-200 bg-zinc-200/50 px-1.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400 sm:inline-flex">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Center Section: Primary Navigation Tabs (Facebook Style) */}
        {/* ============================================================ */}
        <div className="hidden h-full items-center justify-center md:flex">
          <NavTabs />
        </div>

        {/* ============================================================ */}
        {/* Right Section: Utility Actions & User Avatar Dropdown */}
        {/* ============================================================ */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationsDropdown />
          <UserDropdown user={session?.user} />
        </div>
      </div>
    </header>
  );
}
