"use client";

import { usePathname, Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Home, Users, MessageSquare, Hash } from "@/components/icons";
import { useChatStore } from "@/stores/use-chat-store";
import { useChannelStore } from "@/stores/use-channel-store";

export function NavTabs() {
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const totalChatUnread = useChatStore((state) => state.getTotalUnreadCount());
  const totalChannelUnread = useChannelStore((state) => state.getTotalUnreadCount());

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
    {
      href: "/channels",
      label: t("channels"),
      icon: Hash,
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
              relative flex h-11 w-16 items-center justify-center rounded-xl transition-all duration-150 sm:w-20 md:w-24
              ${
                isActive
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200"
              }
            `}
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {tab.href === "/chat" && totalChatUnread > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white shadow-xs">
                  {totalChatUnread > 99 ? "99+" : totalChatUnread}
                </span>
              )}
              {tab.href === "/channels" && totalChannelUnread > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white shadow-xs">
                  {totalChannelUnread > 99 ? "99+" : totalChannelUnread}
                </span>
              )}
            </div>
            <span className="sr-only">{tab.label}</span>

            {isActive && (
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 left-3 right-3 h-0.5 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.4)] dark:bg-violet-500 dark:shadow-[0_0_8px_rgba(139,92,246,0.6)]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
