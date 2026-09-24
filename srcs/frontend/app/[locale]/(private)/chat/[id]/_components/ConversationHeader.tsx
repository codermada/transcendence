"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "@/components/icons";
import type { Participant } from "./conversation.types";

interface ConversationHeaderProps {
  participant: Participant | null;
  isOnline: boolean;
}

export function ConversationHeader({ participant, isOnline }: ConversationHeaderProps) {
  const t = useTranslations("Chat");
  const tNav = useTranslations("Nav");

  const displayName = participant?.name || tNav("user");
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <Link
          href="/chat"
          className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
          aria-label={t("backToMessages")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-xs">
          {participant?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={participant.image}
              alt={displayName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
          <span
            aria-label={isOnline ? tNav("online") : tNav("offline")}
            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white transition-colors dark:ring-zinc-950 ${
              isOnline ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
            }`}
          />
        </div>

        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-white sm:text-lg">
            {displayName}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isOnline ? tNav("online") : tNav("offline")}
          </p>
        </div>
      </div>
    </div>
  );
}
