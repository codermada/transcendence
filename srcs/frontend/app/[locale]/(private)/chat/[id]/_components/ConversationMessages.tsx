"use client";

import type { RefObject } from "react";
import { useTranslations } from "next-intl";
import { Check, CheckCheck, Loader2, MessageSquare } from "@/components/icons";
import { ChatMessageMedia } from "@/components/chat/ChatMessageMedia";
import type { Message } from "./conversation.types";

interface ConversationMessagesProps {
  loading: boolean;
  error: string | null;
  messages: Message[];
  currentUserId?: string;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function ConversationMessages({
  loading,
  error,
  messages,
  currentUserId,
  messagesEndRef,
}: ConversationMessagesProps) {
  const t = useTranslations("Chat");

  return (
    <div className="flex-1 space-y-3 overflow-y-auto py-4" aria-live="polite">
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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
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
          const isMe = msg.senderId === currentUserId;
          const time = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
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
                    title={msg.isSeen ? t("seen") : t("sent")}
                    className="inline-flex items-center"
                  >
                    {msg.isSeen ? (
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
