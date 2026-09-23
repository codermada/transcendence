"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";

import { Link } from "@/i18n/routing";
import { AuthCard2 } from "@/components/auth/AuthCard2";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  const t = useTranslations("Auth.resetPassword");
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!token) {
      toast.error(t("errorMissingToken"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("errorPasswordMismatch"));
      return;
    }

    if (password.length < 8) {
      toast.error(t("errorPasswordTooShort"));
      return;
    }

    setLoading(true);

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message ?? t("errorDefault"));
      return;
    }

    toast.success(t("successMessage"));

    setTimeout(() => {
      router.push("/sign-in");
    }, 2000);
  }

  return (
    <AuthCard2
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <p>
          {t("rememberPassword")}{" "}
          <Link
            href="/sign-in"
            className="text-violet-400 hover:text-violet-300"
          >
            {t("signInLink")}
          </Link>
        </p>
      }
    >
      {!token ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm leading-6 text-red-400">
              {t("invalidLink")}
            </p>
          </div>

          <Link
            href="/forgot-password"
            className="block text-center text-sm font-semibold text-violet-400 transition hover:text-violet-300 hover:underline"
          >
            {t("requestNewLink")}
          </Link>
        </div>
      ) : (
        <ResetPasswordForm
          password={password}
          confirmPassword={confirmPassword}
          loading={loading}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleSubmit}
        />
      )}
    </AuthCard2>
  );
}