"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, UserPlus } from "@/components/icons";

interface AddFriendButtonProps {
  userId: string;
  hasPendingOutgoing: boolean;
  onSuccess?: () => void;
}

export default function AddFriendButton({
  userId,
  hasPendingOutgoing,
  onSuccess,
}: AddFriendButtonProps) {
  const t = useTranslations("Friends");
  const [isPending, setIsPending] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(hasPendingOutgoing);

  async function handleAdd() {
    if (isPending || isRequestSent) return;

    setIsPending(true);

    try {
      const res = await fetch("/nest/friend", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addresseeId: userId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send friend request");
      }

      setIsRequestSent(true);

      onSuccess?.();
    } catch (error) {
      console.error("Error adding friend:", error);
    } finally {
      setIsPending(false);
    }
  }

  if (isRequestSent) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-400"
      >
        {t("pending")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isPending}
      className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}

      {isPending ? t("adding") : t("add")}
    </button>
  );
}
