"use client";

import { useTranslations } from "next-intl";
import { ProfileHeaderUser } from "./profile-header.types";
import { StartMessageButton } from "@/components/chat/StartMessageButton";

import {
  SendFriendRequestButton,
  FriendRequestActionButtons,
  RemoveFriendButton,
  SendCancelFriendRequestButton,
} from "@/components/friends";

export function ProfileHeaderActions({
  user,
}: {
  user: ProfileHeaderUser;
}) {
  const t = useTranslations("ProfilePage.header.actions");

  const buttonBase =
    "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto";

  const secondaryButton = `${buttonBase} bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700`;

  const dangerButton = `${buttonBase} bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900`;

  const receiver = {
    id: user.id,
    name: user.name,
    image: user.image ?? null,
  };

  const containerClass = `
    flex
    w-full
    flex-col
    gap-2
    sm:w-auto
    sm:flex-row
    sm:items-center
    sm:pb-2
  `;

  if (user.isOwnProfile) {
    return <div className={containerClass} />;
  }

  const status = user.friendshipData?.status;
  const friendshipId = user.friendshipData?.friendship?.id ?? "";

  if (status === "BLOCKED_BY_ME") {
    return (
      <div className={containerClass}>
        <button type="button" className={dangerButton}>
          <span aria-hidden>🚫</span>
          {t("unblock")}
        </button>
      </div>
    );
  }

  if (status === "BLOCKED_ME") {
    return (
      <div className={containerClass}>
        <span
          className="
            rounded-lg
            bg-zinc-100
            px-4
            py-2.5
            text-center
            text-sm
            font-medium
            text-zinc-500
            dark:bg-zinc-900
            dark:text-zinc-400
          "
        >
          {t("blocked")}
        </span>
      </div>
    );
  }

  let friendshipAction: React.ReactNode = null;

  switch (status) {
    case "FRIENDS":
      friendshipAction = (
        <RemoveFriendButton
          friendshipId={friendshipId}
        />
      );
      break;

    case "PENDING_INCOMING":
      friendshipAction = (
        <FriendRequestActionButtons
          requestId={friendshipId}
          userId={user.id}
        />
      );
      break;

    case "PENDING_OUTGOING":
      friendshipAction = (
        <SendCancelFriendRequestButton
          userId={user.id}
          requestId={friendshipId}
          hasPendingOutgoing={true}
        />
      );
      break;
    default:
      friendshipAction = (
        <SendCancelFriendRequestButton
          userId={user.id}
          requestId={friendshipId}
          hasPendingOutgoing={false}
        />
      );
      break;
  }

  return (
    <div className={containerClass}>
      {friendshipAction}
      <StartMessageButton
        user={receiver}
        className={secondaryButton}
      />
    </div>
  );
}
