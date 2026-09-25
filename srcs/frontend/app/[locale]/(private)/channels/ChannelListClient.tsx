"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Hash, Loader, Plus, ShieldCheck, User, Users } from "@/components/icons";
import { useChannelStore, type ChannelDetail } from "@/stores/use-channel-store";
import { fetchMyChannels } from "./_services/channel-service";
import { CreateChannelModal } from "./_components/CreateChannelModal";

export function ChannelListClient() {
  const t = useTranslations("Channels");
  const router = useRouter();

  const channels = useChannelStore((state) => state.channels);
  const setChannels = useChannelStore((state) => state.setChannels);

  const [loading, setLoading] = useState(channels.length === 0);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadChannels = useCallback(async () => {
    try {
      const data = await fetchMyChannels();
      setChannels(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [setChannels]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const handleChannelCreated = (newChannel: ChannelDetail) => {
    setCreateModalOpen(false);
    router.push(`/channels/${newChannel.id}`);
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-5 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
            <Hash className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {t("newChannel")}
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-zinc-400">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      ) : channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800 mt-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
            <Users className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
            {t("emptyTitle")}
          </h2>
          <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
            {t("emptyDescription")}
          </p>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="mt-5 flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {t("newChannel")}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => {
            const myRole = channel.members?.[0]?.role;
            const isAdmin = myRole === "ADMIN";
            const unread = channel.unreadCount ?? 0;

            return (
              <Link
                key={channel.id}
                href={`/channels/${channel.id}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 transition-all hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-violet-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition group-hover:scale-105 dark:bg-violet-950/50 dark:text-violet-400">
                      <Hash className="h-5 w-5" />
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white shadow-xs">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isAdmin
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {isAdmin ? (
                        <>
                          <ShieldCheck className="h-3 w-3" />
                          {t("admin")}
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3" />
                          {t("member")}
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="mt-3 font-semibold text-zinc-900 transition group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400 truncate">
                    {channel.title}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {channel.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-400 dark:border-zinc-800/80">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {channel.members?.length || channel._count?.members || 1} {t("member")}(s)
                  </span>
                  <span>
                    {channel.updatedat
                      ? new Date(channel.updatedat).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {createModalOpen && (
        <CreateChannelModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={handleChannelCreated}
        />
      )}
    </div>
  );
}
