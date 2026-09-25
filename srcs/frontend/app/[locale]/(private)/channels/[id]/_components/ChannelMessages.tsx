"use client";

import type { RefObject } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Check, CheckCheck, Loader2, MessageSquare, ShieldCheck } from "@/components/icons";
import { ChatMessageMedia } from "@/components/chat/ChatMessageMedia";
import type { ChannelMemberItem, ChannelMessage } from "./channel.types";

interface ChannelMessagesProps {
  loading: boolean;
  error: string | null;
  messages: ChannelMessage[];
  members?: ChannelMemberItem[];
  currentUserId?: string;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function ChannelMessages({
  loading,
  error,
  messages,
  members,
  currentUserId,
  messagesEndRef,
}: ChannelMessagesProps) {
  const t = useTranslations("Channels");

  const memberRoleMap = new Map<string, string>();
  if (members) {
    members.forEach((m) => memberRoleMap.set(m.userId, m.role));
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto py-4" aria-live="polite">
      {loading && (
        <div className="flex h-full items-center justify-center text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="flex h-full items-center justify-center p-4 text-center">
          <p className="text-sm text-rose-500">{error}</p>
        </div>
      )}

      {!loading && !error && messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
            {t("noMessagesYet")}
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t("sayHello")}
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        messages.map((msg) => {
          const isMe = msg.userId === currentUserId;
          const role = memberRoleMap.get(msg.userId);
          const isAdmin = role === "ADMIN";
          const time = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const senderName = msg.user?.name || "Membre";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              {!isMe && (
                <div className="mb-1 flex items-center gap-1.5 px-1">
                  <Link
                    href={`/profile/${msg.userId}`}
                    className="flex items-center gap-1.5 group"
                  >
                    {msg.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={msg.user.image}
                        alt={senderName}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[9px] font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        {senderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-zinc-700 transition group-hover:text-violet-600 dark:text-zinc-300 dark:group-hover:text-violet-400">
                      {senderName}
                    </span>
                  </Link>

                  {isAdmin && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      {t("admin")}
                    </span>
                  )}
                </div>
              )}

              <div
                className={`max-w-[85%] break-words rounded-2xl px-4 py-2.5 text-sm shadow-xs sm:max-w-[70%] ${
                  isMe
                    ? "rounded-br-xs bg-violet-600 text-white"
                    : "rounded-bl-xs bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                }`}
              >
                {msg.content?.trim() ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : null}
                <ChatMessageMedia mediaUrls={msg.mediaUrls} isMe={isMe} />
              </div>

              <div className="mt-1 flex items-center gap-1 px-1">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {time}
                </span>
                {isMe && (
                  <span
                    title={
                      (msg.seenBy || []).some((id) => id !== currentUserId)
                        ? t("seen")
                        : t("sent")
                    }
                    className="inline-flex items-center"
                  >
                    {(msg.seenBy || []).some((id) => id !== currentUserId) ? (
                      <CheckCheck className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}

      <div ref={messagesEndRef} />
    </div>
  );
}
