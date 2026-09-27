"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Hash, Settings, Users } from "@/components/icons";
import type { ChannelDetail } from "./channel.types";

interface ChannelHeaderProps {
  channel: ChannelDetail | null;
  onOpenMembersModal: () => void;
  onOpenChannelSettings: () => void;
}

export function ChannelHeader({ channel, onOpenMembersModal, onOpenChannelSettings }: ChannelHeaderProps) {
  const t = useTranslations("Channels");

  const memberCount = channel?.members?.length ?? 0;

  return (
    <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/channels"
          className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white shrink-0"
          aria-label={t("backToChannels")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {channel?.mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={channel.mediaUrl}
            alt={channel.title}
            className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-zinc-200/80 dark:ring-zinc-800"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
            <Hash className="h-5 w-5" />
          </div>
        )}

        <div className="min-w-0">
          <h1 className="text-base font-bold text-zinc-900 dark:text-white sm:text-lg truncate">
            {channel?.title || "..."}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {channel ? (
              <>
                <span className="font-medium text-violet-600 dark:text-violet-400">
                  {t("membersCount", { count: memberCount })}
                </span>
                {channel.description ? ` • ${channel.description}` : ""}
              </>
            ) : (
              "..."
            )}
          </p>
        </div>
      </div>

      <div className="flex items-end gap-1.5">
        <button
          type="button"
          onClick={onOpenMembersModal}
          disabled={!channel}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <span className="hidden sm:inline">{t("membersAndRoles")}</span>
          <span className="sm:hidden">{memberCount}</span>
        </button>
        <button
          type="button"
          onClick={onOpenChannelSettings}
          disabled={!channel}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Settings className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <span className="hidden sm:inline">{t("settings")}</span>
        </button>
      </div>
    </div>
  );
}
