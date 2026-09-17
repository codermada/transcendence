"use client";

import { usePathname, Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Home, Users, MessageSquare } from "@/components/icons";

export function NavTabs() {
  const pathname = usePathname();
  const t = useTranslations("Nav");

  const tabs = [
    {
      href: "/feed",
      label: t("feed"),
      icon: Home,
    },
    {
      href: "/friends",
      label: t("friends"),
      icon: Users,
    },
    {
      href: "/chat",
      label: t("chat"),
      icon: MessageSquare,
    },
  ];

  return (
    <nav
      className="flex h-full items-center justify-center gap-1 sm:gap-2"
      aria-label="Primary Navigation"
    >
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(tab.href + "/");
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            title={tab.label}
            className={`
              relative flex h-11 w-16 sm:w-20 md:w-24 items-center justify-center rounded-xl transition-all duration-150
              ${
                isActive
                  ? "bg-violet-500/15 text-violet-400 shadow-sm"
                  : "text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-200"
              }
            `}
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">{tab.label}</span>

            {isActive && (
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 left-3 right-3 h-0.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
