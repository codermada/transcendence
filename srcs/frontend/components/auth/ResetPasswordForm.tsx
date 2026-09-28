"use client";

import { useTranslations } from "next-intl";

type ResetPasswordFormProps = {
  password: string;
  confirmPassword: string;
  loading: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function ResetPasswordForm({
  password,
  confirmPassword,
  loading,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: ResetPasswordFormProps) {
  const t = useTranslations("Auth.resetPassword");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-subtle">
          {t("passwordLabel")}
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          disabled={loading}
          placeholder={t("passwordPlaceholder")}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-border-hover disabled:opacity-60"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-subtle"
        >
          {t("confirmPasswordLabel")}
        </label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          disabled={loading}
          placeholder={t("confirmPasswordPlaceholder")}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-border-hover disabled:opacity-60"
        />
      </div>

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