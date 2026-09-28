"use client";

import { usePathname, Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Home,
  Users,
  MessageSquare,
  Hash,
  Settings,
} from "@/components/icons";
import { useChatStore } from "@/stores/use-chat-store";
import { useChannelStore } from "@/stores/use-channel-store";

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const totalChatUnread = useChatStore((state) => state.getTotalUnreadCount());
  const totalChannelUnread = useChannelStore((state) => state.getTotalUnreadCount());

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
      href: "/channels",
      label: t("channels"),
      icon: Hash,
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
        fixed bottom-0 inset-x-0 z-40 h-16
        border-t border-zinc-200/80 bg-white/95 text-zinc-900 backdrop-blur-md
        transition-colors
        dark:border-zinc-800/80 dark:bg-zinc-950/95 dark:text-white
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
              flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 transition-colors
              ${
                isActive
                  ? "font-semibold text-violet-600 dark:text-violet-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }
            `}
          >
            <div
              className={`
                relative flex h-8 w-8 items-center justify-center rounded-xl transition-all
                ${
                  isActive
                    ? "bg-violet-100 dark:bg-violet-500/15"
                    : ""
                }
              `}
            >
              <Icon className="h-5 w-5" />
              {item.href === "/chat" && totalChatUnread > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-violet-600 px-0.5 text-[9px] font-bold text-white shadow-xs">
                  {totalChatUnread > 99 ? "99+" : totalChatUnread}
                </span>
              )}
              {item.href === "/channels" && totalChannelUnread > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-violet-600 px-0.5 text-[9px] font-bold text-white shadow-xs">
                  {totalChannelUnread > 99 ? "99+" : totalChannelUnread}
                </span>
              )}
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
