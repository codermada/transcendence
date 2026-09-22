"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
} from "@/components/icons";

export type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string | null;
};

type UsersTableProps = {
  users: User[];
  onUserUpdated: (updatedUser: User) => void;
  onUserDeleted: (userId: string) => void;
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

export default function UsersTable({
  users,
  onUserUpdated,
  onUserDeleted,
}: UsersTableProps) {
  const t = useTranslations("Admin.users");

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
      console.error("Failed to change user role:", error);
      toast.error(t("errorRole"));
      return;
    }

    onUserUpdated({ ...user, role: newRole });
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
      onUserUpdated(updated);
      setEditingUser(null);
      toast.success(t("toastUpdated"));
    } catch (err) {
      console.error("Failed to update user:", err);
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

      onUserDeleted(user.id);
      setDeletingUser(null);
      toast.success(t("toastDeleted"));

      const remaining = users.length - 1;
      const newTotalPages = Math.max(1, Math.ceil(remaining / USERS_PER_PAGE));
      if (safePage > newTotalPages) setCurrentPage(newTotalPages);
    } catch (err) {
      console.error("Failed to delete user:", err);
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
          border border-border bg-surface/40
          shadow-2xl shadow-black/20 backdrop-blur-xl
        "
      >
        <div
          aria-hidden
          className="
            pointer-events-none absolute inset-x-10 top-0 h-px
            bg-gradient-to-r from-transparent via-brand-500/50 to-transparent
            shadow-[0_0_14px_rgb(139_92_246_/_0.35)]
          "
        />

        <div className="overflow-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover/60">
                <th className="w-12 border-r border-border px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                  #
                </th>
                <th className="min-w-[220px] border-r border-border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  {t("colUser")}
                </th>
                <th className="min-w-[300px] border-r border-border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  {t("colEmail")}
                </th>
                <th className="min-w-[180px] border-r border-border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  {t("colRole")}
                </th>
                <th className="w-24 px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
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
                      "group border-b border-border transition-colors last:border-b-0",
                      isUpdating ? "opacity-50" : "hover:bg-surface-hover/50",
                    ].join(" ")}
                  >
                    <td className="border-r border-border bg-surface-hover/30 px-3 py-2.5 text-center text-xs text-muted">
                      {startIndex + index + 1}
                    </td>

                    <td className="border-r border-border px-4 py-2.5 text-foreground">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={user.image}
                          alt=""
                          className="h-7 w-7 shrink-0 rounded-full border border-border object-cover"
                        />
                        <span>{user.name}</span>
                        {isCurrentUser && (
                          <span
                            className="
                              rounded-full border border-brand-500/30
                              bg-brand-500/10 px-2 py-0.5
                              text-[10px] font-medium text-brand-400
                            "
                          >
                            {t("you")}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="border-r border-border px-4 py-2.5 text-subtle">
                      {user.email}
                    </td>

                    <td className="border-r border-border px-4 py-2.5">
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
                            rounded-lg p-2 text-muted transition-colors
                            hover:bg-surface-hover hover:text-foreground
                            disabled:cursor-not-allowed disabled:opacity-40
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
                            rounded-lg p-2 text-muted transition-colors
                            hover:bg-danger/10 hover:text-danger
                            disabled:cursor-not-allowed disabled:opacity-40
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
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    {t("empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              Showing{" "}
              <span className="font-medium text-foreground">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(startIndex + USERS_PER_PAGE, users.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
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
                  flex items-center gap-1 rounded-lg border border-border
                  px-3 py-1.5 text-xs text-subtle transition-colors
                  hover:border-border-hover hover:text-foreground
                  focus:outline-none focus:ring-2 focus:ring-brand-500/20
                  disabled:cursor-not-allowed disabled:opacity-40
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
                        focus:ring-2 focus:ring-brand-500/20
                        ${
                          isActive
                            ? "bg-brand-600 text-white shadow-[0_0_12px_rgb(139_92_246_/_0.4)]"
                            : "text-muted hover:bg-surface-hover hover:text-foreground"
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
                  flex items-center gap-1 rounded-lg border border-border
                  px-3 py-1.5 text-xs text-subtle transition-colors
                  hover:border-border-hover hover:text-foreground
                  focus:outline-none focus:ring-2 focus:ring-brand-500/20
                  disabled:cursor-not-allowed disabled:opacity-40
                "
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

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
// RoleSwitcher — up/down buttons to cycle through roles
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
      ? "border-brand-500/40 text-brand-400"
      : role === "moderator"
        ? "border-amber-500/40 text-amber-400"
        : "border-border text-muted";

  return (
    <div
      className={`
        inline-flex items-center overflow-hidden rounded-lg border
        bg-background ${colorClasses}
        ${disabled ? "opacity-40" : ""}
      `}
      title={disabled ? disabledReason : undefined}
    >
      <span className="min-w-[86px] px-2.5 py-1.5 text-xs font-medium">
        {labels[role]}
      </span>

      <div className="flex h-full flex-col border-l border-border">
        <button
          type="button"
          disabled={disabled || !canGoUp}
          onClick={() => canGoUp && onChange(ROLE_ORDER[index + 1])}
          title={titles.up}
          aria-label={titles.up}
          className="
            flex h-4 w-6 items-center justify-center text-muted
            transition-colors hover:bg-surface-hover hover:text-foreground
            disabled:cursor-not-allowed disabled:opacity-30
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
            flex h-4 w-6 items-center justify-center border-t border-border
            text-muted transition-colors
            hover:bg-surface-hover hover:text-foreground
            disabled:cursor-not-allowed disabled:opacity-30
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
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-semibold text-foreground">
          {t("title")}
        </h2>
        <p className="mb-5 text-sm text-muted">
          {t("subtitle", { name: user.name })}
        </p>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
              {t("nameLabel")}
            </span>
            <input
              type="text"
              value={name}
              disabled={isBusy}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full rounded-lg border border-border bg-background
                px-3 py-2 text-sm text-foreground outline-none
                focus:border-brand-500 disabled:opacity-50
              "
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
              {t("emailLabel")}
            </span>
            <input
              type="email"
              value={email}
              disabled={isBusy}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full rounded-lg border border-border bg-background
                px-3 py-2 text-sm text-foreground outline-none
                focus:border-brand-500 disabled:opacity-50
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
              rounded-lg border border-border px-4 py-2 text-sm text-muted
              transition-colors hover:bg-surface-hover
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            disabled={!dirty || !valid || isBusy}
            onClick={() => onSave({ name: name.trim(), email: email.trim() })}
            className="
              rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white
              transition-colors hover:bg-brand-500
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
  const [typed, setTyped] = useState("");
  const matches = typed.trim() === user.name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={isBusy ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-danger/30 bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-semibold text-danger">
          {t("title")}
        </h2>
        <p className="mb-5 text-sm text-muted">
          {t("subtitle", { name: user.name, email: user.email })}
        </p>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
            {t("confirmLabel", { name: user.name })}
          </span>
          <input
            type="text"
            value={typed}
            disabled={isBusy}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
            className="
              w-full rounded-lg border border-border bg-background
              px-3 py-2 text-sm text-foreground outline-none
              focus:border-danger disabled:opacity-50
            "
          />
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="
              rounded-lg border border-border px-4 py-2 text-sm text-muted
              transition-colors hover:bg-surface-hover
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            disabled={!matches || isBusy}
            onClick={onConfirm}
            className="
              rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white
              transition-colors hover:bg-danger/80
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