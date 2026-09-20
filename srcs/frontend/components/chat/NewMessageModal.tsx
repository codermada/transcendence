"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { usePresence } from "@/hooks/use-presence";
import { Close, Loader2, Send } from "@/components/icons";
import { getInitials } from "@/lib/utils/user-utils";

export type ReceiverUser = {
  id: string;
  name: string;
  image?: string | null;
  pseudo?: string | null;
  email?: string | null;
};

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiver: ReceiverUser | null;
}

export function NewMessageModal({ isOpen, onClose, receiver }: NewMessageModalProps) {
  const t = useTranslations("Chat");
  const router = useRouter();
  const { checkIsOnline } = usePresence();

  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  const isOnline = receiver ? checkIsOnline(receiver.id) : false;

  const displayName = receiver?.name?.trim() || receiver?.pseudo || receiver?.email?.split("@")[0] || "User";
  const initials = getInitials(displayName);

  const handleClose = useCallback(() => {
    setContent("");
    setError(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  }

  async function handleSend() {
    if (!receiver || !content.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const res = await fetch("/nest/chat/messages", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: receiver.id,
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || t("sendError"));
      }

      const createdMessage = await res.json();
      const conversationId = createdMessage.messageTableId;

      handleClose();
      router.push(`/chat/${conversationId}`);
    } catch (err: unknown) {
      setError((err as Error).message || t("sendError"));
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDownTextarea(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!isOpen || !receiver) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-message-modal-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <h2 id="new-message-modal-title" className="text-base font-semibold text-zinc-900 dark:text-white">
            {t("newMessageTitle")}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 cursor-pointer"
          >
            <Close className="h-4 w-4" />
          </button>
        </div>

        <div className="my-6 flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-indigo-600 text-lg font-bold text-white shadow-md ring-2 ring-violet-500/20">
            {receiver.image ? (
              <img
                src={receiver.image}
                alt={displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
            <span
              aria-label={isOnline ? t("online") : t("offline")}
              title={isOnline ? t("online") : t("offline")}
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-zinc-900 transition-colors ${
                isOnline ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
              }`}
            />
          </div>

          <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-white">
            {displayName}
          </h3>

          {receiver.pseudo && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              @{receiver.pseudo}
            </p>
          )}

          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {t("startConversationWith")} {displayName}
          </p>
        </div>

        <div className="mb-4">
          <textarea
            autoFocus
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDownTextarea}
            placeholder={t("typeMessagePlaceholder")}
            disabled={isSending}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-white dark:focus:border-violet-500 dark:focus:bg-zinc-950"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSending}
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !content.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("sending")}</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>{t("sendMessage")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
