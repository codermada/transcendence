"use client";

import { useTranslations } from "next-intl";
import { ProfileHeaderUser } from "./profile-header.types";
import  AddFriendButton  from "./AddFriendButton"
import { RejectFriendButton } from "./RejectFriendButton";
import { EditProfileButton } from "./EditProfileButton";


export function ProfileHeaderActions({
  user,
}: {
  user: ProfileHeaderUser;
}) {
  
  const t = useTranslations("ProfilePage.header.actions");

  const buttonBase =
    "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto";

  const secondaryButton =
    `${buttonBase} bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700`;

  const primaryButton =
    `${buttonBase} bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600`;

  const dangerButton =
    `${buttonBase} bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900`;

  if (user.isOwnProfile) {
    return (
      <div
        className="
          flex
          w-full
          flex-col
          gap-2
          sm:w-auto
          sm:flex-row
          sm:items-center
          sm:pb-2
        "
      >
        <EditProfileButton />
      </div>
    );
  }

  if (user.hasBlockedByMe) {
    return (
      <div
        className="
          flex
          w-full
          flex-col
          gap-2
          sm:w-auto
          sm:flex-row
          sm:items-center
          sm:pb-2
        "
      >
        <button type="button" className={dangerButton}>
          <span aria-hidden>🚫</span>
          {t("unblock")}
        </button>
      </div>
    );
  }

  if (user.hasBlockedMe) {
    return (
      <div
        className="
          flex
          w-full
          flex-col
          gap-2
          sm:w-auto
          sm:flex-row
          sm:items-center
          sm:pb-2
        "
      >
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

  if (user.isFriend) {
    return (
      <div
        className="
          flex
          w-full
          flex-col
          gap-2
          sm:w-auto
          sm:flex-row
          sm:items-center
          sm:pb-2
        "
      >
        <button type="button" className={secondaryButton}>
          <span aria-hidden>✓</span>
          {t("friends")}
        </button>

        <button type="button" className={secondaryButton}>
          <span aria-hidden>💬</span>
          {t("message")}
        </button>
      </div>
    );
  }

  if (user.hasPendingIncoming) {
    return (
      <div
        className="
          flex
          w-full
          flex-col
          gap-2
          sm:w-auto
          sm:flex-row
          sm:items-center
          sm:pb-2
        "
      >
        <button type="button" className={primaryButton}>
          <span aria-hidden>✓</span>
          {t("acceptRequest")}
        </button>

        <RejectFriendButton userId={user.id} />
        <button type="button" className={secondaryButton}>
          <span aria-hidden>×</span>
          {t("declineRequest")}
        </button>

        <button type="button" className={secondaryButton}>
          <span aria-hidden>💬</span>
          {t("message")}
        </button>
      </div>
    );
  }

  if (user.hasPendingOutgoing) {
    return (
      <div
        className="
          flex
          w-full
          flex-col
          gap-2
          sm:w-auto
          sm:flex-row
          sm:items-center
          sm:pb-2
        "
      >
        <button type="button" className={secondaryButton}>
          <span aria-hidden>✓</span>
          {t("requestSent")}
        </button>

        <button type="button" className={secondaryButton}>
          <span aria-hidden>💬</span>
          {t("message")}
        </button>
      </div>
    );
  }

  if (user.hasRejected) {
    return (
      <div
        className="
          flex
          w-full
          flex-col
          gap-2
          sm:w-auto
          sm:flex-row
          sm:items-center
          sm:pb-2
        "
      >
      <AddFriendButton 
        userId={user.id} 
        hasPendingOutgoing={user.hasPendingOutgoing}/>
        <button type="button" className={secondaryButton}>
          <span aria-hidden>💬</span>
          {t("message")}
        </button>
      </div>
    );
  }

  if (user.hasCancelled) {
    return (
      <div
        className="
          flex
          w-full
          flex-col
          gap-2
          sm:w-auto
          sm:flex-row
          sm:items-center
          sm:pb-2
        "
      >
      <AddFriendButton 
        userId={user.id} 
        hasPendingOutgoing={user.hasPendingOutgoing}/>
        <button type="button" className={secondaryButton}>
          <span aria-hidden>💬</span>
          {t("message")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="
        flex
        w-full
        flex-col
        gap-2
        sm:w-auto
        sm:flex-row
        sm:items-center
        sm:pb-2
      "
    >
      <AddFriendButton 
        userId={user.id} 
        hasPendingOutgoing={user.hasPendingOutgoing}/>
      <button type="button" className={secondaryButton}>
        <span aria-hidden>💬</span>
        {t("message")}
      </button>
    </div>
  );
}
