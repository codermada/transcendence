"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Close,
  Loader,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Trash,
  User,
  UserMinus,
  Users,
} from "@/components/icons";
import { fetchAvailableUsers } from "../../_services/channel-service";
import type { AvailableUser } from "../../_components/channel-list.types";
import type { ChannelDetail } from "@/stores/use-channel-store";

interface ChannelMembersModalProps {
  channel: ChannelDetail;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onLeaveChannel: () => Promise<void>;
  onDeleteChannel: () => Promise<void>;
  onKickMember: (memberId: string) => Promise<void>;
  onUpdateRole: (memberId: string, role: "ADMIN" | "MEMBER") => Promise<void>;
  onAddMember: (memberId: string) => Promise<void>;
}

export function ChannelMembersModal({
  channel,
  currentUserId,
  isOpen,
  onClose,
  onLeaveChannel,
  onDeleteChannel,
  onKickMember,
  onUpdateRole,
  onAddMember,
}: ChannelMembersModalProps) {
  const t = useTranslations("Channels");

  const [search, setSearch] = useState("");
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const myMembership = channel.members?.find((m) => m.userId === currentUserId);
  const isAdmin = myMembership?.role === "ADMIN";

  const filteredMembers = (channel.members || []).filter((m) => {
    const query = search.toLowerCase();
    const nameMatch = m.user?.name?.toLowerCase().includes(query) ?? false;
    const emailMatch = m.user?.email?.toLowerCase().includes(query) ?? false;
    return nameMatch || emailMatch;
  });

  useEffect(() => {
    if (isAddingMode && availableUsers.length === 0) {
      setLoadingAvailable(true);
      fetchAvailableUsers()
        .then((users) => {
          setAvailableUsers(users);
        })
        .catch(() => {
          // ignore
        })
        .finally(() => {
          setLoadingAvailable(false);
        });
    }
  }, [isAddingMode, availableUsers.length]);

  if (!isOpen) return null;

  const existingMemberIds = new Set(channel.members?.map((m) => m.userId) || []);
  const usersToInvite = availableUsers.filter((u) => !existingMemberIds.has(u.id));

  const handleKick = async (userId: string) => {
    if (!window.confirm(t("confirmKick"))) return;
    setActionInProgress(`kick-${userId}`);
    try {
      await onKickMember(userId);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRoleToggle = async (userId: string, currentRole: "ADMIN" | "MEMBER") => {
    const nextRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";
    setActionInProgress(`role-${userId}`);
    try {
      await onUpdateRole(userId, nextRole);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleAdd = async (userId: string) => {
    setActionInProgress(`add-${userId}`);
    try {
      await onAddMember(userId);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm(t("confirmLeave"))) return;
    setActionInProgress("leave");
    try {
      await onLeaveChannel();
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("confirmDelete"))) return;
    setActionInProgress("delete");
    try {
      await onDeleteChannel();
    } finally {
      setActionInProgress(null);
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
                {t("membersAndRoles")}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {channel.title} • {t("membersCount", { count: channel.members?.length || 0 })}
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

        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder={isAddingMode ? t("searchUser") : "Rechercher un membre…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-1.5 text-xs text-zinc-900 outline-none transition focus:border-violet-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsAddingMode(!isAddingMode)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer shrink-0 ${
                isAddingMode
                  ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                  : "bg-violet-600 text-white shadow-xs hover:bg-violet-500"
              }`}
            >
              {isAddingMode ? (
                <>
                  <Close className="h-3.5 w-3.5" />
                  <span>Fermer</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t("inviteMembers")}</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="mt-3 flex-1 overflow-y-auto space-y-1.5 rounded-xl border border-zinc-200 bg-zinc-50/50 p-2 max-h-72 dark:border-zinc-800 dark:bg-zinc-950/40">
          {isAddingMode ? (
            loadingAvailable ? (
              <div className="flex h-32 items-center justify-center text-zinc-400">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : usersToInvite.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-xs text-zinc-400">
                {t("noUsersFound")}
              </div>
            ) : (
              usersToInvite.map((u) => {
                const isAdding = actionInProgress === `add-${u.id}`;
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-lg p-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {u.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.image}
                          alt={u.name || "Avatar"}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                          {u.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-semibold text-zinc-900 truncate dark:text-white">
                          {u.name || "Utilisateur"}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate dark:text-zinc-400">
                          {u.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAdding}
                      onClick={() => handleAdd(u.id)}
                      className="flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs transition hover:bg-violet-500 disabled:opacity-50 cursor-pointer"
                    >
                      {isAdding ? (
                        <Loader className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      Ajouter
                    </button>
                  </div>
                );
              })
            )
          ) : (
            filteredMembers.map((member) => {
              const isMe = member.userId === currentUserId;
              const isTargetAdmin = member.role === "ADMIN";
              const isActioningRole = actionInProgress === `role-${member.userId}`;
              const isActioningKick = actionInProgress === `kick-${member.userId}`;

              return (
                <div
                  key={member.userId}
                  className="flex items-center justify-between rounded-lg p-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Link
                      href={`/profile/${member.userId}`}
                      className="flex items-center gap-2.5 group min-w-0"
                    >
                      {member.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.user.image}
                          alt={member.user.name || "Avatar"}
                          className="h-8 w-8 rounded-full object-cover transition group-hover:opacity-80"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                          {member.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-semibold text-zinc-900 truncate group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400">
                          {member.user?.name || "Membre"}{" "}
                          {isMe && (
                            <span className="text-[10px] text-zinc-400 font-normal">
                              (moi)
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate dark:text-zinc-400">
                          {member.user?.email || ""}
                        </p>
                      </div>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isTargetAdmin
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {isTargetAdmin ? (
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

                    {isAdmin && !isMe && (
                      <div className="flex items-center gap-1 pl-1">
                        <button
                          type="button"
                          disabled={isActioningRole}
                          onClick={() => handleRoleToggle(member.userId, member.role)}
                          title={isTargetAdmin ? t("demoteToMember") : t("promoteToAdmin")}
                          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          {isActioningRole ? (
                            <Loader className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isActioningKick}
                          onClick={() => handleKick(member.userId)}
                          title={t("kickMember")}
                          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 cursor-pointer"
                        >
                          {isActioningKick ? (
                            <Loader className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            type="button"
            disabled={Boolean(actionInProgress)}
            onClick={handleLeave}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("leaveChannel")}
          </button>

          {isAdmin && (
            <button
              type="button"
              disabled={Boolean(actionInProgress)}
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/60 cursor-pointer"
            >
              <Trash className="h-3.5 w-3.5" />
              {t("deleteChannel")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
