"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePresence } from "@/hooks/use-presence";
import { useChatStore } from "@/stores/use-chat-store";
import { Loader2, MessageSquare } from "@/components/icons";

export function ChatListClient() {
  const t = useTranslations("Chat");
  const tNav = useTranslations("Nav");
  const { checkIsOnline } = usePresence();

  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const [loading, setLoading] = useState(conversations.length === 0);

  useEffect(() => {
    let cancelled = false;

    async function fetchConversations() {
      try {
        const res = await fetch("/nest/chat/conversations", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data)) {
            setConversations(data);
          }
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchConversations();

    return () => {
      cancelled = true;
    };
  }, [setConversations]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-5 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/friends/search">
            <button
              type="button"
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 cursor-pointer"
            >
              {t("newMessage")}
            </button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-white/80 p-10 text-center shadow-xs backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-violet-600 ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:text-violet-400/70 dark:ring-zinc-800">
            <MessageSquare className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
            {t("emptyTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            {t("emptyDescription")}
          </p>
          <div className="mt-6">
            <Link href="/friends/search">
              <button
                type="button"
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 cursor-pointer"
              >
                {t("newMessage")}
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60">
          {conversations.map((conv) => {
            const participant = conv.participant;
            const displayName = participant?.name || tNav("user");
            const initials = displayName
              .split(" ")
              .map((n) => n[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase() || "U";

            const isOnline = participant ? checkIsOnline(participant.id) : false;
            const time = conv.lastMessage
              ? new Date(conv.lastMessage.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })
              : "";

            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="flex items-center justify-between gap-4 p-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-indigo-600 text-sm font-semibold text-white">
                    {participant?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={participant.image}
                        alt={displayName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                    <span
                      aria-label={isOnline ? tNav("online") : tNav("offline")}
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-zinc-900 transition-colors ${
                        isOnline ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {conv.lastMessage?.content || t("sayHello")}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {time}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
