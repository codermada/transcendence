"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Close, Loader, Search, Users } from "@/components/icons";
import {
  type AvailableUser,
  fetchAvailableUsers,
  createChannel,
} from "../_services/channel-service";
import type { ChannelDetail } from "@/stores/use-channel-store";

interface CreateChannelModalProps {
  onClose: () => void;
  onCreated: (newChannel: ChannelDetail) => void;
}

export function CreateChannelModal({ onClose, onCreated }: CreateChannelModalProps) {
  const t = useTranslations("Channels");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AvailableUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAvailableUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleUser = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredUsers = users.filter((u) => {
    const query = search.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(query) ?? false;
    const emailMatch = u.email?.toLowerCase().includes(query) ?? false;
    return nameMatch || emailMatch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const newChannel = await createChannel({
        title: title.trim(),
        description: description.trim(),
        membersIds: Array.from(selectedIds),
      });
      onCreated(newChannel);
    } catch (err: unknown) {
      setError((err as Error).message || "Error creating channel.");
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {t("createChannelTitle")}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
          >
            <Close className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-1 flex-col overflow-hidden gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t("nameLabel")}
            </label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder={t("namePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-violet-400 dark:focus:bg-zinc-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t("descLabel")}
            </label>
            <input
              type="text"
              required
              maxLength={200}
              placeholder={t("descPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-violet-400 dark:focus:bg-zinc-900"
            />
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {t("inviteMembers")}
              </label>
              <span className="text-[11px] font-medium text-violet-600 dark:text-violet-400">
                {selectedIds.size} {t("selected")}
              </span>
            </div>

            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder={t("searchUser")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-1.5 text-xs text-zinc-900 outline-none transition focus:border-violet-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 rounded-xl border border-zinc-200 bg-zinc-50/50 p-2 max-h-44 dark:border-zinc-800 dark:bg-zinc-950/40">
              {loadingUsers ? (
                <div className="flex h-24 items-center justify-center text-zinc-400">
                  <Loader className="h-5 w-5 animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-xs text-zinc-400">
                  {t("noUsersFound")}
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedIds.has(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleUser(user.id)}
                      className={`flex items-center justify-between rounded-lg p-2 cursor-pointer transition select-none ${
                        isSelected
                          ? "bg-violet-50 border border-violet-200 dark:bg-violet-950/30 dark:border-violet-800/50"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={user.name || "Avatar"}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            {user.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="truncate">
                          <p className="text-xs font-semibold text-zinc-900 truncate dark:text-white">
                            {user.name || "Utilisateur"}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate dark:text-zinc-400">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                          isSelected
                            ? "border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-500"
                            : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-3" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !description.trim()}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-violet-500/20 transition hover:bg-violet-500 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader className="h-3.5 w-3.5 animate-spin" />
                  {t("creating")}
                </>
              ) : (
                t("create")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
