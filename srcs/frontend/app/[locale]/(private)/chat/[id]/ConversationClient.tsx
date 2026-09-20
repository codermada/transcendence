"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth/use-session";
import { usePresence } from "@/hooks/use-presence";
import { ArrowLeft, Loader2, MessageSquare, Send } from "@/components/icons";

interface MessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isSeen: boolean;
}

interface Participant {
  id: string;
  name: string;
  image: string | null;
}

interface ConversationItem {
  id: string;
  participant: Participant | null;
  lastMessage: MessageItem | null;
  unreadCount: number;
  updatedAt: string;
}

interface ConversationClientProps {
  conversationId: string;
}

export function ConversationClient({ conversationId }: ConversationClientProps) {
  const t = useTranslations("Chat");
  const tNav = useTranslations("Nav");
  const { data: session } = useSession();
  const { checkIsOnline } = usePresence();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = session?.user?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversation participant & message history
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch conversations list to identify the participant
        const convsRes = await fetch("/nest/chat/conversations", {
          credentials: "include",
        });

        if (!convsRes.ok) throw new Error("Failed to load conversation details");
        const convs: ConversationItem[] = await convsRes.json();
        const currentConv = convs.find((c) => c.id === conversationId);

        if (!cancelled && currentConv) {
          setParticipant(currentConv.participant);
        }

        // 2. Fetch messages for this conversation
        const msgRes = await fetch(`/nest/chat/conversations/${conversationId}/messages?limit=50`, {
          credentials: "include",
        });

        if (!msgRes.ok) throw new Error("Failed to load messages");
        const msgData = await msgRes.json();

        if (!cancelled) {
          // Backend returns newest first (desc), reverse for chronological display
          const rawMessages: MessageItem[] = msgData.messages || [];
          setMessages([...rawMessages].reverse());
        }

        // 3. Mark conversation as seen
        await fetch(`/nest/chat/conversations/${conversationId}/seen`, {
          method: "POST",
          credentials: "include",
        });
      } catch (err: unknown) {
        if (!cancelled) {
          setError((err as Error).message || "Error loading conversation");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  // Auto-scroll to bottom when messages load or change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isParticipantOnline = participant ? checkIsOnline(participant.id) : false;

  async function handleSendMessage() {
    if (!inputValue.trim() || !participant || isSending) return;

    const content = inputValue.trim();
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

      const createdMessage: MessageItem = await res.json();
      setMessages((prev) => [...prev, createdMessage]);
    } catch (err) {
      console.error(err);
      // Restore input on failure
      setInputValue(content);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  const displayName = participant?.name || "User";
  const initials = displayName
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
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
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

        {!loading && !error && messages.length === 0 && (
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
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-xs break-words ${
                    isMe
                      ? "bg-violet-600 text-white rounded-br-xs"
                      : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white rounded-bl-xs"
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
                <span className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500 px-1">
                  {time}
                </span>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-zinc-200/80 pt-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <input
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
            disabled={!inputValue.trim() || isSending || loading}
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
