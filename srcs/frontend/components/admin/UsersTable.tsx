"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
} from "@/components/icons";
import { authClient } from "@/lib/auth/auth-client";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string | null;
};

type UsersTableProps = {
  users: User[];
};

const USERS_PER_PAGE = 10;

// ── Role helpers ────────────────────────────────────────────
const ROLE_ORDER = ["user", "moderator", "admin"] as const;
type Role = (typeof ROLE_ORDER)[number];

function normalizeRole(role: string | null | undefined): Role {
  const r = (role ?? "user").toLowerCase();
  if (r === "admin") return "admin";
  if (r === "moderator") return "moderator";
  return "user";
}

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const t = useTranslations("Admin.users");

  const [users, setUsers] = useState<User[]>(initialUsers);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [creatingUser, setCreatingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * USERS_PER_PAGE;
  const currentUsers = useMemo(
    () => users.slice(startIndex, startIndex + USERS_PER_PAGE),
    [users, startIndex],
  );

  // ── Role change ─────────────────────────────────────────────
  const handleRoleChange = async (user: User, newRole: Role) => {
    if (user.id === currentUserId) return;
    if (normalizeRole(user.role) === newRole) return;

    setUpdatingUserId(user.id);

    const { error } = await authClient.admin.setRole({
      userId: user.id,
      role: newRole,
    });

    setUpdatingUserId(null);

    if (error) {
      toast.error(t("errorRole"));
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
    );
    toast.success(t("toastRoleUpdated"));
  };

  // ── Edit save ────────────────────────────────────────────────
  const handleEditSave = async (
    id: string,
    patch: { name: string; email: string },
  ) => {
    setUpdatingUserId(id);
    try {
      const res = await fetch(`/nest/user/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? t("errorUpdate"));
      }

      const updated: User = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      setEditingUser(null);
      toast.success(t("toastUpdated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("errorUpdate"));
    } finally {
      setUpdatingUserId(null);
    }
  };

  // ── Delete confirm ───────────────────────────────────────────
  const handleDeleteConfirm = async (user: User) => {
    setUpdatingUserId(user.id);
    try {
      const res = await fetch(`/nest/user/${user.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? t("errorDelete"));
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setDeletingUser(null);
      toast.success(t("toastDeleted"));

      const remaining = users.length - 1;
      const newTotalPages = Math.max(1, Math.ceil(remaining / USERS_PER_PAGE));
      if (safePage > newTotalPages) setCurrentPage(newTotalPages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("errorDelete"));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <div
        className="
          relative overflow-hidden rounded-2xl
          border border-zinc-200/80 bg-white/80
          shadow-xl transition-colors backdrop-blur-xl
          dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:shadow-2xl dark:shadow-black/20
        "
      >
        <div
          aria-hidden
          className="
            pointer-events-none absolute inset-x-10 top-0 h-px
            bg-gradient-to-r from-transparent via-violet-500/50 to-transparent
            shadow-[0_0_14px_rgb(139_92_246_/_0.35)]
          "
        />

        {/* ── Header with create button ─────────────────────── */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-800/80">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("title")}
          </h3>

          <button
            type="button"
            onClick={() => setCreatingUser(true)}
            className="
              inline-flex items-center gap-1.5 rounded-lg bg-violet-600
              px-3 py-1.5 text-xs font-medium text-white transition-colors
              hover:bg-violet-500 focus:outline-none focus:ring-2
              focus:ring-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50
              shadow-sm shadow-violet-600/30 dark:shadow-[0_0_12px_rgb(139_92_246_/_0.4)]
            "
          >
            <Plus className="h-3.5 w-3.5" />
            {t("createUser")}
          </button>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800/80 dark:bg-zinc-800/40">
                <th className="w-12 border-r border-zinc-200/80 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                  #
                </th>
                <th className="min-w-[220px] border-r border-zinc-200/80 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                  {t("colUser")}
                </th>
                <th className="min-w-[300px] border-r border-zinc-200/80 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                  {t("colEmail")}
                </th>
                <th className="min-w-[180px] border-r border-zinc-200/80 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                  {t("colRole")}
                </th>
                <th className="w-24 px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {t("colActions")}
                </th>
              </tr>
            </thead>

            <tbody>
              {currentUsers.map((user, index) => {
                const isCurrentUser = user.id === currentUserId;
                const isUpdating = updatingUserId === user.id;

                return (
                  <tr
                    key={user.id}
                    className={[
                      "group border-b border-zinc-200/80 transition-colors last:border-b-0 dark:border-zinc-800/80",
                      isUpdating
                        ? "opacity-50"
                        : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50",
                    ].join(" ")}
                  >
                    <td className="border-r border-zinc-200/80 bg-zinc-50/40 px-3 py-2.5 text-center text-xs text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-800/20 dark:text-zinc-400">
                      {startIndex + index + 1}
                    </td>

                    <td className="border-r border-zinc-200/80 px-4 py-2.5 text-zinc-900 dark:border-zinc-800/80 dark:text-zinc-100">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={user.image}
                          alt=""
                          className="h-7 w-7 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
                        />
                        <span>{user.name}</span>
                        {isCurrentUser && (
                          <span
                            className="
                              rounded-full border border-violet-500/30
                              bg-violet-50 px-2 py-0.5
                              text-[10px] font-medium text-violet-600
                              dark:bg-violet-500/10 dark:text-violet-400
                            "
                          >
                            {t("you")}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="border-r border-zinc-200/80 px-4 py-2.5 text-zinc-600 dark:border-zinc-800/80 dark:text-zinc-400">
                      {user.email}
                    </td>

                    <td className="border-r border-zinc-200/80 px-4 py-2.5 dark:border-zinc-800/80">
                      <RoleSwitcher
                        role={normalizeRole(user.role)}
                        disabled={isCurrentUser || isUpdating}
                        disabledReason={
                          isCurrentUser ? t("cannotChangeOwnRole") : undefined
                        }
                        onChange={(next) => handleRoleChange(user, next)}
                        labels={{
                          user: t("roleUser"),
                          moderator: t("roleModerator"),
                          admin: t("roleAdmin"),
                        }}
                        titles={{
                          up: t("promoteRole"),
                          down: t("demoteRole"),
                        }}
                      />
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => setEditingUser(user)}
                          title={t("edit")}
                          aria-label={t("edit")}
                          className="
                            rounded-lg p-2 text-zinc-500 transition-colors
                            hover:bg-zinc-100 hover:text-zinc-900
                            disabled:cursor-not-allowed disabled:opacity-40
                            dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100
                          "
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          disabled={isCurrentUser || isUpdating}
                          onClick={() => setDeletingUser(user)}
                          title={
                            isCurrentUser ? t("cannotDeleteSelf") : t("delete")
                          }
                          aria-label={t("delete")}
                          className="
                            rounded-lg p-2 text-zinc-500 transition-colors
                            hover:bg-red-50 hover:text-red-600
                            disabled:cursor-not-allowed disabled:opacity-40
                            dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400
                          "
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {currentUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    {t("empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-zinc-200/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800/80">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing{" "}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {Math.min(startIndex + USERS_PER_PAGE, users.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {users.length}
              </span>{" "}
              users
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
                className="
                  flex items-center gap-1 rounded-lg border border-zinc-200/80
                  px-3 py-1.5 text-xs text-zinc-600 transition-colors
                  hover:border-zinc-300 hover:text-zinc-900
                  focus:outline-none focus:ring-2 focus:ring-violet-500/20
                  disabled:cursor-not-allowed disabled:opacity-40
                  dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100
                "
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  const isActive = safePage === page;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      aria-current={isActive ? "page" : undefined}
                      className={`
                        min-w-8 rounded-lg px-2 py-1.5 text-xs font-medium
                        transition-colors focus:outline-none
                        focus:ring-2 focus:ring-violet-500/20
                        ${
                          isActive
                            ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30 dark:bg-violet-600 dark:shadow-[0_0_12px_rgb(139_92_246_/_0.4)]"
                            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                },
              )}

              <button
                type="button"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
                className="
                  flex items-center gap-1 rounded-lg border border-zinc-200/80
                  px-3 py-1.5 text-xs text-zinc-600 transition-colors
                  hover:border-zinc-300 hover:text-zinc-900
                  focus:outline-none focus:ring-2 focus:ring-violet-500/20
                  disabled:cursor-not-allowed disabled:opacity-40
                  dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100
                "
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {creatingUser && (
        <CreateUserModal
          onClose={() => setCreatingUser(false)}
          onCreated={(newUser) => {
            setUsers((prev) => [...prev, newUser]);
            setCreatingUser(false);
          }}
        />
      )}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          isBusy={updatingUserId === editingUser.id}
          onClose={() => setEditingUser(null)}
          onSave={(patch) => handleEditSave(editingUser.id, patch)}
        />
      )}

      {deletingUser && (
        <ConfirmDeleteModal
          user={deletingUser}
          isBusy={updatingUserId === deletingUser.id}
          onClose={() => setDeletingUser(null)}
          onConfirm={() => handleDeleteConfirm(deletingUser)}
        />
      )}
    </>
  );
}

// ============================================================
// RoleSwitcher
// ============================================================

function RoleSwitcher({
  role,
  disabled,
  disabledReason,
  onChange,
  labels,
  titles,
}: {
  role: Role;
  disabled?: boolean;
  disabledReason?: string;
  onChange: (next: Role) => void;
  labels: Record<Role, string>;
  titles: { up: string; down: string };
}) {
  const index = ROLE_ORDER.indexOf(role);
  const canGoUp = index < ROLE_ORDER.length - 1;
  const canGoDown = index > 0;

  const colorClasses =
    role === "admin"
      ? "border-violet-500/40 text-violet-600 dark:border-violet-500/40 dark:text-violet-400"
      : role === "moderator"
        ? "border-amber-500/40 text-amber-600 dark:border-amber-500/40 dark:text-amber-400"
        : "border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400";

  return (
    <div
      className={`
        inline-flex items-center overflow-hidden rounded-lg border
        bg-white dark:bg-zinc-950 ${colorClasses}
        ${disabled ? "opacity-40" : ""}
      `}
      title={disabled ? disabledReason : undefined}
    >
      <span className="min-w-[86px] px-2.5 py-1.5 text-xs font-medium">
        {labels[role]}
      </span>

      <div className="flex h-full flex-col border-l border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          disabled={disabled || !canGoUp}
          onClick={() => canGoUp && onChange(ROLE_ORDER[index + 1])}
          title={titles.up}
          aria-label={titles.up}
          className="
            flex h-4 w-6 items-center justify-center text-zinc-500
            transition-colors hover:bg-zinc-100 hover:text-zinc-900
            disabled:cursor-not-allowed disabled:opacity-30
            dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100
          "
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          disabled={disabled || !canGoDown}
          onClick={() => canGoDown && onChange(ROLE_ORDER[index - 1])}
          title={titles.down}
          aria-label={titles.down}
          className="
            flex h-4 w-6 items-center justify-center border-t border-zinc-200
            text-zinc-500 transition-colors
            hover:bg-zinc-100 hover:text-zinc-900
            disabled:cursor-not-allowed disabled:opacity-30
            dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100
          "
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Modals
// ============================================================

function UserEditModal({
  user,
  isBusy,
  onClose,
  onSave,
}: {
  user: User;
  isBusy: boolean;
  onClose: () => void;
  onSave: (patch: { name: string; email: string }) => void;
}) {
  const t = useTranslations("Admin.users.editModal");
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const dirty = name !== user.name || email !== user.email;
  const valid = name.trim().length > 0 && /\S+@\S+\.\S+/.test(email);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={isBusy ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl transition-colors dark:border-zinc-800/80 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t("title")}
        </h2>
        <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
          {t("subtitle", { name: user.name })}
        </p>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("nameLabel")}
            </span>
            <input
              type="text"
              value={name}
              disabled={isBusy}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full rounded-lg border border-zinc-200 bg-zinc-50
                px-3 py-2 text-sm text-zinc-900 outline-none
                focus:border-violet-500 focus:bg-white disabled:opacity-50
                dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:bg-zinc-950
              "
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("emailLabel")}
            </span>
            <input
              type="email"
              value={email}
              disabled={isBusy}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full rounded-lg border border-zinc-200 bg-zinc-50
                px-3 py-2 text-sm text-zinc-900 outline-none
                focus:border-violet-500 focus:bg-white disabled:opacity-50
                dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:bg-zinc-950
              "
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="
              rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600
              transition-colors hover:bg-zinc-100
              disabled:cursor-not-allowed disabled:opacity-50
              dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800
            "
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            disabled={!dirty || !valid || isBusy}
            onClick={() => onSave({ name: name.trim(), email: email.trim() })}
            className="
              rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white
              transition-colors hover:bg-violet-500
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({
  user,
  isBusy,
  onClose,
  onConfirm,
}: {
  user: User;
  isBusy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("Admin.users.deleteModal");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={isBusy ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-red-200/80 bg-white p-6 shadow-2xl transition-colors dark:border-red-900/40 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-semibold text-red-600 dark:text-red-400">
          {t("title")}
        </h2>
        <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
          {t("subtitle", { name: user.name, email: user.email })}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="
              rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600
              transition-colors hover:bg-zinc-100
              disabled:cursor-not-allowed disabled:opacity-50
              dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800
            "
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={onConfirm}
            className="
              rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white
              transition-colors hover:bg-red-500
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {isBusy ? t("deleting") : t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (user: User) => void;
}) {
  const t = useTranslations("Admin.users.createModal");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [isBusy, setIsBusy] = useState(false);

  const valid =
    name.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    password.length >= 8;

  const handleSubmit = async () => {
    if (!valid || isBusy) return;

    setIsBusy(true);

    const { data, error } = await authClient.admin.createUser({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    });

    if (error) {
      toast.error(t("error"));
      setIsBusy(false);
      return;
    }

    onCreated({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      image: data.user.image ?? "",
      role: data.user.role ?? role,
    });

    toast.success(t("toastCreated"));
    setIsBusy(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={isBusy ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl transition-colors dark:border-zinc-800/80 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t("title")}
        </h2>
        <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
          {t("subtitle")}
        </p>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("nameLabel")}
            </span>
            <input
              type="text"
              value={name}
              disabled={isBusy}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full rounded-lg border border-zinc-200 bg-zinc-50
                px-3 py-2 text-sm text-zinc-900 outline-none
                focus:border-violet-500 focus:bg-white disabled:opacity-50
                dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:bg-zinc-950
              "
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("emailLabel")}
            </span>
            <input
              type="email"
              value={email}
              disabled={isBusy}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full rounded-lg border border-zinc-200 bg-zinc-50
                px-3 py-2 text-sm text-zinc-900 outline-none
                focus:border-violet-500 focus:bg-white disabled:opacity-50
                dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:bg-zinc-950
              "
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("passwordLabel")}
            </span>
            <input
              type="password"
              value={password}
              disabled={isBusy}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="
                w-full rounded-lg border border-zinc-200 bg-zinc-50
                px-3 py-2 text-sm text-zinc-900 outline-none
                focus:border-violet-500 focus:bg-white disabled:opacity-50
                dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:bg-zinc-950
              "
            />
            <span className="mt-1 block text-[11px] text-zinc-400 dark:text-zinc-500">
              {t("passwordHint")}
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("roleLabel")}
            </span>
            <select
              value={role}
              disabled={isBusy}
              onChange={(e) => setRole(e.target.value as Role)}
              className="
                w-full rounded-lg border border-zinc-200 bg-zinc-50
                px-3 py-2 text-sm text-zinc-900 outline-none
                focus:border-violet-500 focus:bg-white disabled:opacity-50
                dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:bg-zinc-950
              "
            >
              <option value="user">{t("roleUser")}</option>
              <option value="moderator">{t("roleModerator")}</option>
              <option value="admin">{t("roleAdmin")}</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="
              rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600
              transition-colors hover:bg-zinc-100
              disabled:cursor-not-allowed disabled:opacity-50
              dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800
            "
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            disabled={!valid || isBusy}
            onClick={handleSubmit}
            className="
              rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white
              transition-colors hover:bg-violet-500
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {isBusy ? t("creating") : t("create")}
          </button>
        </div>
      </div>
    </div>
  );
}