"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, X } from "@/components/icons";
import { toast } from "sonner";
import { networkService } from "@/lib/api/friends";

interface DeclineFriendRequestButtonProps {
  requestId: string;
  onSuccess?: () => void;
}

export function DeclineFriendRequestButton({
  requestId,
  onSuccess,
}: DeclineFriendRequestButtonProps) {
  const t = useTranslations("FriendsComponents");

  const [isPending, setIsPending] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);

  async function handleDecline() {
    if (isPending || isDeclined) return;

    setIsPending(true);

    try {
      await networkService.declineRequest(requestId);

      setIsDeclined(true);
      toast.success(t("requestDeclined"));

      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("requestDeclineError")
      );
    } finally {
      setIsPending(false);
    }
  }

  if (isDeclined) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400"
      >
        <X className="h-3.5 w-3.5" />
        {t("declined")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDecline}
      disabled={isPending}
      className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 active:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}

      {isPending ? t("declining") : t("decline")}
    </button>
  );
}
