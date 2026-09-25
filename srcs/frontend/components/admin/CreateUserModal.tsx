"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import type { User } from "./UsersTable";

type Role = "user" | "moderator" | "admin";

type CreateUserModalProps = {
  onClose: () => void;
  onUserCreated: (user: User) => void;
};

export function CreateUserModal({
  onClose,
  onUserCreated,
}: CreateUserModalProps) {
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

    onUserCreated({
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