import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("Auth.forgotPassword");

  return (
    <AuthCard
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <p>
          {t("rememberPassword")}{" "}
          <Link href="/sign-in" className="text-violet-400 hover:text-violet-300">
            {t("signInLink")}
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
