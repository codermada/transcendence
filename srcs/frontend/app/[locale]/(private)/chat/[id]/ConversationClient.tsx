"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth/use-session";
import { usePresence } from "@/hooks/use-presence";
import { useChatStore, Message } from "@/stores/use-chat-store";
import { useConversationSocket } from "@/hooks/use-chat-socket";
import { ArrowLeft, Check, CheckCheck, Loader2, MessageSquare, Send } from "@/components/icons";

interface Participant {
  id: string;
  name: string;
  image: string | null;
}

interface ConversationItem {
  id: string;
  participant?: Participant | null;
  user1?: Participant | null;
  user2?: Participant | null;
  user1Id?: string;
  user2Id?: string;
  unreadCount?: number;
  updatedAt?: string;
}

interface ConversationClientProps {
  conversationId: string;
}

export function ConversationClient({ conversationId }: ConversationClientProps) {
  const t = useTranslations("Chat");
  const tNav = useTranslations("Nav");
  const { data: session } = useSession();
  const { checkIsOnline } = usePresence();

  useConversationSocket(conversationId);

  const activeMessages = useChatStore((state) => state.activeMessages);
  const setActiveMessages = useChatStore((state) => state.setActiveMessages);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const addActiveMessage = useChatStore((state) => state.addActiveMessage);

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMarkedMsgIdRef = useRef<string | null>(null);

  const currentUserId = session?.user?.id;

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  // Mark conversation as seen strictly via REST API
  const markAsSeen = useCallback(async () => {
    if (!conversationId) return;
    try {
      await fetch(`/nest/chat/conversations/${conversationId}/seen`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to mark conversation as seen via REST:", err);
    }
  }, [conversationId]);

  // Set active conversation in store for global tracking
  useEffect(() => {
    setActiveConversationId(conversationId);
    return () => {
      setActiveConversationId(null);
    };
  }, [conversationId, setActiveConversationId]);

  // Load conversation details & message history
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch conversation details and messages in parallel
        const [currentConvRes, msgRes] = await Promise.all([
          fetch(`/nest/chat/conversations/${conversationId}`, {
            credentials: "include",
          }),
          fetch(`/nest/chat/conversations/${conversationId}/messages?limit=50`, {
            credentials: "include",
          }),
        ]);

        if (!currentConvRes.ok) {
          throw new Error("Failed to load conversation details");
        }
        const currentConv: ConversationItem = await currentConvRes.json();

        let resolvedParticipant: Participant | null = currentConv.participant ?? null;
        if (!resolvedParticipant && currentConv.user1 && currentConv.user2) {
          resolvedParticipant =
            currentConv.user1.id === currentUserId ? currentConv.user2 : currentConv.user1;
        }

        let rawMessages: Message[] = [];
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          rawMessages = msgData.messages || [];
        }

        // Fallback: extract participant from messages if not yet resolved
        if (!resolvedParticipant && currentUserId && rawMessages.length > 0) {
          const otherMsg = rawMessages.find((m) => m.senderId !== currentUserId);
          if (otherMsg?.sender) {
            resolvedParticipant = otherMsg.sender;
          }
        }

        if (!cancelled) {
          if (resolvedParticipant) {
            setParticipant(resolvedParticipant);
          }
          // Backend returns newest first (desc), reverse for chronological display
          setActiveMessages([...rawMessages].reverse());
          setLoading(false);
          setTimeout(() => scrollToBottom(false), 50);
        }

        // Mark conversation as seen via REST
        await markAsSeen();
      } catch (err: unknown) {
        if (!cancelled) {
          setError((err as Error).message || t("loadError"));
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [conversationId, currentUserId, markAsSeen, scrollToBottom, setActiveMessages, t]);

  // Auto-scroll to bottom on message count update
  useEffect(() => {
    if (!loading && activeMessages.length > 0) {
      scrollToBottom(true);
    }
  }, [activeMessages.length, loading, scrollToBottom]);

  // Send seen notification
  useEffect(() => {
    if (!currentUserId || activeMessages.length === 0) return;

    const lastMsg = activeMessages[activeMessages.length - 1];
    if (
      lastMsg.senderId !== currentUserId &&
      !lastMsg.isSeen &&
      lastMarkedMsgIdRef.current !== lastMsg.id
    ) {
      lastMarkedMsgIdRef.current = lastMsg.id;
      markAsSeen();
    }
  }, [activeMessages, currentUserId, markAsSeen]);

  const isParticipantOnline = participant ? checkIsOnline(participant.id) : false;

  async function handleSendMessage() {
    const content = inputValue.trim();
    if (!content || !participant || isSending) return;

    setInputValue("");
    setIsSending(true);

    try {
      const res = await fetch("/nest/chat/messages", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: participant.id,
          content,
        }),
      });

      if (!res.ok) {
        throw new Error(t("sendError"));
      }

      const createdMessage = await res.json();
      addActiveMessage(createdMessage);
      scrollToBottom(true);
    } catch (err) {
      console.error("Failed to send message:", err);
      // Restore input on failure
      setInputValue(content);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  const displayName = participant?.name || tNav("user");
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col p-3 sm:p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label={t("backToMessages")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-xs">
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
              aria-label={isParticipantOnline ? tNav("online") : tNav("offline")}
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-950 transition-colors ${
                isParticipantOnline ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
              }`}
            />
          </div>

          <div>
            <h1 className="text-base font-bold text-zinc-900 dark:text-white sm:text-lg">
              {displayName}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isParticipantOnline ? tNav("online") : tNav("offline")}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3" aria-live="polite">
        {loading && (
          <div className="flex h-full items-center justify-center text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="flex h-full items-center justify-center text-center p-4">
            <p className="text-sm text-rose-500">{error}</p>
          </div>
        )}

        {!loading && !error && activeMessages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
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
          activeMessages.map((msg) => {
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
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-xs break-words ${
                    isMe
                      ? "bg-violet-600 text-white rounded-br-xs"
                      : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white rounded-bl-xs"
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
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

      {/* Input Bar */}
      <div className="border-t border-zinc-200/80 pt-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("typeMessagePlaceholder")}
            disabled={loading || isSending}
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSending || loading || !participant}
            aria-label={t("sendMessage")}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
