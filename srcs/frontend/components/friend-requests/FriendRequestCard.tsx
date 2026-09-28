"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { StartMessageButton } from "@/components/chat/StartMessageButton";
import { Button } from "@/components/ui/Button";
import { FriendRequestAvatar } from "./FriendRequestAvatar";
import { pickOther, type Friendship, type Tab } from "./types";

type Props = {
  friendship: Friendship;
  viewerId: string | null;
  tab: Tab;
  isBusy: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onCancel: (id: string) => void;
};

export function FriendRequestCard({
  friendship,
  viewerId,
  tab,
  isBusy,
  onAccept,
  onReject,
  onCancel,
}: Props) {
  const t = useTranslations("FriendRequests");
  const other = pickOther(friendship, viewerId, tab);
  const displayName = other.name?.trim() || other.pseudo?.trim() || t("unnamed");

  return (
    <li className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl transition hover:border-violet-300/60 dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none dark:hover:border-violet-500/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href={`/profile/${other.id}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 outline-none ring-violet-500/40 transition hover:bg-violet-50/60 focus-visible:ring-2 dark:hover:bg-violet-500/5"
        >
          <FriendRequestAvatar user={other} fallback={displayName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {displayName}
            </p>
            {other.pseudo && (
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                @{other.pseudo}
              </p>
            )}
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <StartMessageButton user={other} disabled={isBusy} />

          {tab === "incoming" ? (
            <>
              <Button
                variant="primary"
                loading={isBusy}
                loadingLabel={t("actions.accepting")}
                onClick={() => onAccept(friendship.id)}
              >
                {t("actions.accept")}
              </Button>
              <Button
                variant="secondary"
                loading={isBusy}
                loadingLabel={t("actions.rejecting")}
                onClick={() => onReject(friendship.id)}
              >
                {t("actions.reject")}
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              loading={isBusy}
              loadingLabel={t("actions.cancelling")}
              onClick={() => onCancel(friendship.id)}
            >
              {t("actions.cancel")}
            </Button>
          )}
        </div>
      </div>

      {friendship.message && (
        <p className="mt-3 border-t border-zinc-200/80 pt-3 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          “{friendship.message}”
        </p>
      )}
    </li>
  );
}