"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, UserPlus } from "@/components/icons";
import { toast } from "sonner";
import { networkService } from "@/lib/api/friends";

interface SendFriendRequestButtonProps {
  addresseeId: string;
  hasPendingOutgoing?: boolean;
  onSuccess?: () => void;
}

export function SendFriendRequestButton({
  addresseeId,
  hasPendingOutgoing = false,
  onSuccess,
}: SendFriendRequestButtonProps) {
  const t = useTranslations("FriendsComponents");

  const [isPending, setIsPending] = useState(false);
  const [isRequestSent, setIsRequestSent] =
    useState(hasPendingOutgoing);

  async function handleSendRequest() {
    if (isPending || isRequestSent) return;

    setIsPending(true);

    try {
      await networkService.sendFriendRequest(addresseeId);

      setIsRequestSent(true);
      toast.success(t("requestSent"));

      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("requestSendError.request.sendError")
      );
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
      onClick={handleSendRequest}
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
