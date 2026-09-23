"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { AuthCard2 } from "@/components/auth/AuthCard2";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";


export default function ForgotPasswordPage() {
  const t = useTranslations("Auth.forgotPassword");

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
      <ForgotPasswordForm/>
    </AuthCard2>
  );
}