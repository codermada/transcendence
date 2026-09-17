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
        fixed top-0 inset-x-0 h-14 z-40
        border-b border-zinc-800/80
        bg-zinc-950/85 backdrop-blur-md
        text-white
      "
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* ============================================================ */}
        {/* Left Section: Brand & Quick Search */}
        {/* ============================================================ */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <Link
            href="/feed"
            className="flex items-center gap-2 font-bold tracking-tight text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-violet-500/40 rounded-lg p-1"
            aria-label="Heartbeat Feed"
          >
            <Logo className="h-6 w-6 text-violet-500" />
            <span className="hidden sm:inline text-lg font-bold">
              {t("brand")}
              <span className="text-violet-500">{t("brandAccent")}</span>
            </span>
          </Link>

          {/* Search Pill Input */}
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="
                h-9 w-36 sm:w-48 lg:w-64 rounded-full
                border border-zinc-800 bg-zinc-900/80
                pl-9 pr-3 sm:pr-10 text-xs text-white placeholder-zinc-500
                transition-all duration-150
                focus:border-violet-500/80 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-violet-500/80
              "
            />
            <kbd className="pointer-events-none absolute right-2.5 hidden sm:inline-flex items-center rounded border border-zinc-700 bg-zinc-800/80 px-1.5 text-[10px] font-mono text-zinc-400">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Center Section: Primary Navigation Tabs (Facebook Style) */}
        {/* ============================================================ */}
        <div className="hidden h-full md:flex items-center justify-center">
          <NavTabs />
        </div>

        {/* ============================================================ */}
        {/* Right Section: Utility Actions & User Avatar Dropdown */}
        {/* ============================================================ */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationsDropdown />
          <UserDropdown user={session?.user} />
        </div>
      </div>
    </header>
  );
}
