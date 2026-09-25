"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { FRIEND_API } from "@/components/friend-requests/types";

interface RejectFriendButtonProps {
  friendshipId: string;
  onSuccess?: () => void;
}

export function RejectFriendButton({
  friendshipId,
  onSuccess,
}: RejectFriendButtonProps) {
  const t = useTranslations("FriendRequests");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReject = useCallback(async () => {
    if (isBusy) return;

    setIsBusy(true);
    setError(null);

    const url = FRIEND_API.reject(friendshipId);

    try {
      const response = await fetch(url, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        const body = await response.text();
        console.error("Reject failed", {
          url,
          friendshipId,
          status: response.status,
          body,
        });
        throw new Error(`Failed to reject friendship (${response.status})`);
      }

      onSuccess?.();
    } catch (err) {
      setError(t("actionError"));
      console.error(err);
    } finally {
      setIsBusy(false);
    }
  }, [friendshipId, isBusy, onSuccess, t]);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleReject}
        disabled={isBusy}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
      >
        {isBusy ? t("actions.rejecting") : t("actions.reject")}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}