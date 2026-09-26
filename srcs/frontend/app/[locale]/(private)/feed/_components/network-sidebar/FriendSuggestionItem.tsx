"use client";

import { StartMessageButton } from "@/components/chat/StartMessageButton";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { FriendSuggestionItemProps } from "./network-sidebar.types";

export function FriendSuggestionItem({
  userId,
  name,
  image,
  initials,
  mutualFriends,
  onSend,
}: FriendSuggestionItemProps) {
  const t = useTranslations("Feed.network-sidebar.FriendSuggestionItem");
  const [isPending, setIsPending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSend = async () => {
    setIsPending(true);
    try {
      await onSend?.(userId);
      setIsSent(true);
    } catch {
      setIsPending(false);
    }
  };

  return (
    <li className="flex items-center justify-between gap-3">
      <Link
        href={`/profile/${userId}`}
        className="group flex min-w-0 items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
      >
        <img
          src={image ?? "/nest/uploads/default-avatar.png"}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-zinc-900 transition-colors group-hover:text-violet-600 dark:text-zinc-100 dark:group-hover:text-violet-400">
            {name}
          </p>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
            {mutualFriends} {mutualFriends !== 1 ? t("mutualFriends") : t("mutualFriend")}
          </span>
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-1.5">
        <StartMessageButton
          variant="icon"
          user={{ id: userId, name, image }}
        />

        {isSent ? (
          <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
            {t("requestedButton") || "Envoyé"}
          </span>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={handleSend}
            className="rounded-lg bg-violet-600/10 px-2.5 py-1 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-600 hover:text-white disabled:opacity-50 dark:bg-violet-500/15 dark:text-violet-400 dark:hover:bg-violet-600 dark:hover:text-white"
          >
            {t("addButton")}
          </button>
        )}
      </div>
    </li>
  );
}