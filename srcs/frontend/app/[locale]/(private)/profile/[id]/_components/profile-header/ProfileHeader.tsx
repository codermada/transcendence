"use client";

import { useTranslations } from "next-intl";

import { StartMessageButton } from "@/components/chat/StartMessageButton";
import { authClient } from "@/lib/auth/auth-client";
import type { ProfileHeaderUser } from "./profile-header.types";

export function ProfileHeader({
  user,
}: {
  user: ProfileHeaderUser;
}) {
  const t = useTranslations("ProfilePage.header");
  const { data: session, isPending } = authClient.useSession();

  const isMe =
    session?.user?.id != null &&
    String(session.user.id) === String(user.id);

  // Hide while loading, hide if no session, hide if it's me.
  const showMessageButton = !isPending && session != null && !isMe;

  return (
    <header className="w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-6xl
          flex-col
          gap-4
          px-3
          py-4
          sm:flex-row
          sm:items-end
          sm:gap-5
          sm:px-6
          sm:py-6
          lg:px-8
        "
      >
        <div className="shrink-0">
          <div
            className="
              relative
              h-24
              w-24
              overflow-hidden
              rounded-full
              ring-4
              ring-white
              sm:h-32
              sm:w-32
              lg:h-40
              lg:w-40
              dark:ring-zinc-900
            "
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  bg-zinc-200
                  text-2xl
                  font-semibold
                  text-zinc-500
                  sm:text-3xl
                  dark:bg-zinc-800
                  dark:text-zinc-400
                "
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div
          className="
            flex
            min-w-0
            flex-1
            flex-col
            gap-1
            sm:pb-1
            lg:pb-2
          "
        >
          <h1
            className="
              max-w-full
              truncate
              text-xl
              font-bold
              text-zinc-900
              sm:text-2xl
              lg:text-3xl
              dark:text-white
            "
          >
            {user.name}
          </h1>

          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("friendsCount", {
              count: user.friendsCount,
            })}
          </p>

          {user.city && (
            <p
              className="
                flex
                min-w-0
                items-center
                gap-1
                truncate
                text-sm
                text-zinc-500
                dark:text-zinc-400
              "
            >
              <span aria-hidden>◈</span>

              <span className="truncate">
                {user.city}
              </span>
            </p>
          )}
        </div>

        {showMessageButton && (
          <div className="flex shrink-0 items-center gap-2 sm:self-end sm:pb-1 lg:pb-2">
            <StartMessageButton
              user={{
                id: user.id,
                name: user.name,
                avatarUrl: user.avatarUrl,
              }}
              disabled={user.isSelf}
              conversationId={user.conversationId}
            />
          </div>
        )}
      </div>
    </header>
  );
}