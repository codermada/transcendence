"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "@/components/icons";
import { toast } from "sonner";
import { networkService } from "@/lib/api/friends";

interface AcceptFriendRequestButtonProps {
  requestId: string;
  onSuccess?: () => void;
}

export function AcceptFriendRequestButton({
  requestId,
  onSuccess,
}: AcceptFriendRequestButtonProps) {
  const t = useTranslations("FriendsComponents");

  const [isPending, setIsPending] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  async function handleAccept() {
    if (isPending || isAccepted) return;

    setIsPending(true);

    try {
      await networkService.acceptRequest(requestId);

      setIsAccepted(true);
      toast.success(t("requestAccepted"));

      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("requestAcceptError")
      );
    } finally {
      setIsPending(false);
    }
  }

  if (isAccepted) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400"
      >
        <Check className="h-3.5 w-3.5" />
        {t("accepted")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAccept}
      disabled={isPending}
      className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Check className="h-3.5 w-3.5" />
      )}

      {isPending ? t("accepting") : t("accept")}
    </button>
  );
}
