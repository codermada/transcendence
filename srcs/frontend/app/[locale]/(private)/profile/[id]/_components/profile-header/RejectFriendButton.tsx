"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

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

    const FRIEND_API = {
    me: () => `/nest/user/me`,
    incoming: (page = 1, limit = 50) =>
        `/nest/friend/requests/incoming?page=${page}&limit=${limit}`,
    outgoing: (page = 1, limit = 50) =>
        `/nest/friend/requests/outgoing?page=${page}&limit=${limit}`,
    accept: (id: string) => `/nest/friend/${id}/accept`,
    reject: (id: string) => `/nest/friend/${id}/reject`,
    cancel: (id: string) => `/nest/friend/${id}/cancel`,
    } as const;

  const handleReject = useCallback(async () => {
    if (isBusy) return;

    try {
      setIsBusy(true);

      const response = await fetch(FRIEND_API.reject(friendshipId), {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to reject friendship");
      }

      onSuccess?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }, [friendshipId, isBusy, onSuccess]);

  return (
    <button
      type="button"
      onClick={handleReject}
      disabled={isBusy}
      className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
    >
      {isBusy ? t("actions.rejecting") : t("actions.reject")}
    </button>
  );
}
