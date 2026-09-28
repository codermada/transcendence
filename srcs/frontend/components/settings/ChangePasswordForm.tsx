"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";

export function ChangePasswordForm() {
  const t = useTranslations("Settings.security.password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error(t("errorTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("errorMismatch"));
      return;
    }

    if (newPassword === currentPassword) {
      toast.error(t("errorSameAsCurrent"));
      return;
    }

    setLoading(true);

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message ?? t("errorDefault"));
      return;
    }

    toast.success(t("successMessage"));

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        id="currentPassword"
        label={t("currentPasswordLabel")}
        placeholder={t("currentPasswordPlaceholder")}
        value={currentPassword}
        onChange={setCurrentPassword}
        disabled={loading}
        autoComplete="current-password"
      />

      <Field
        id="newPassword"
        label={t("newPasswordLabel")}
        placeholder={t("newPasswordPlaceholder")}
        value={newPassword}
        onChange={setNewPassword}
        disabled={loading}
        autoComplete="new-password"
      />

      <Field
        id="confirmPassword"
        label={t("confirmPasswordLabel")}
        placeholder={t("confirmPasswordPlaceholder")}
        value={confirmPassword}
        onChange={setConfirmPassword}
        disabled={loading}
        autoComplete="new-password"
      />

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  placeholder,
  value,
  onChange,
  disabled,
  autoComplete,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  autoComplete: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-subtle">
        {label}
      </label>
      <input
        id={id}
        type="password"
        name={id}
        autoComplete={autoComplete}
        required
        minLength={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="
          w-full rounded-xl border border-border bg-surface px-4 py-3
          text-sm text-foreground placeholder:text-muted outline-none
          transition-colors focus:border-border-hover disabled:opacity-60
        "
      />
    </div>
  );
}