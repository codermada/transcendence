"use client";

import { usePathname, Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Home,
  Users,
  MessageSquare,
  Settings,
} from "@/components/icons";

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("Nav");

  const items = [
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
    {
      href: "/settings",
      label: t("settings"),
      icon: Settings,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="
        fixed bottom-0 inset-x-0 h-16 z-40
        bg-zinc-950/95 backdrop-blur-md
        border-t border-zinc-800/80
        flex items-center justify-around px-2
        md:hidden
      "
    >
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/feed" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`
              flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-colors
              ${
                isActive
                  ? "text-violet-400 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }
            `}
          >
            <div
              className={`
                relative flex h-8 w-8 items-center justify-center rounded-xl transition-all
                ${isActive ? "bg-violet-500/15" : ""}
              `}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] leading-none tracking-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
