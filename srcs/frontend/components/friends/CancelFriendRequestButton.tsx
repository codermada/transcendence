"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, X } from "@/components/icons";
import { toast } from "sonner";
import { networkService } from "@/lib/api/friends";

interface CancelFriendRequestButtonProps {
  requestId: string;
  onSuccess?: () => void;
}

export function CancelFriendRequestButton({
  requestId,
  onSuccess,
}: CancelFriendRequestButtonProps) {
  const t = useTranslations("FriendsComponents");

  const [isPending, setIsPending] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  async function handleCancel() {
    if (isPending || isCancelled) return;

    setIsPending(true);

    try {
      await networkService.cancelRequest(requestId);

      setIsCancelled(true);
      toast.success(t("requestCancelled"));

      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("requestCancelError")
      );
    } finally {
      setIsPending(false);
    }
  }

  if (isCancelled) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-zinc-500/30 bg-zinc-500/10 px-4 py-2 text-sm font-semibold text-zinc-400"
      >
        <X className="h-3.5 w-3.5" />
        {t("cancelled")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={isPending}
      className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-zinc-500/30 bg-zinc-500/10 px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-500/20 active:bg-zinc-500/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}

      {isPending ? t("cancelling") : t("cancel")}
    </button>
  );
}
