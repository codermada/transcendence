"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, UserMinus } from "@/components/icons";
import { toast } from "sonner";
import { networkService } from "@/lib/api/friends";

interface RemoveFriendButtonProps {
  friendshipId: string;
  onSuccess?: () => void;
}

export function RemoveFriendButton({
  friendshipId,
  onSuccess,
}: RemoveFriendButtonProps) {
  const t = useTranslations("FriendsComponents");

  const [isPending, setIsPending] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  async function handleRemove() {
    if (isPending || isRemoved) return;

    setIsPending(true);

    try {
      await networkService.removeFriend(friendshipId);

      setIsRemoved(true);
      toast.success(t("friendRemoved"));

      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("friendRemoveError")
      );
    } finally {
      setIsPending(false);
    }
  }

  if (isRemoved) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-zinc-500/30 bg-zinc-500/10 px-4 py-2 text-sm font-semibold text-zinc-400"
      >
        <UserMinus className="h-3.5 w-3.5" />
        {t("removed")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 active:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <UserMinus className="h-3.5 w-3.5" />
      )}

      {isPending ? t("removing") : t("removeFriend")}
    </button>
  );
}
