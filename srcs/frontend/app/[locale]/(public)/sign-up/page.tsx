import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default async function SignUpPage() {
  const t = await getTranslations("Auth.signUp");

  return (
    <AuthCard
      title={<>{t("title")}</>}
      subtitle={t("subtitle")}
      footer={
        <p className="text-muted">
          {t("hasAccount")}{" "}
          <Link
            href="/sign-in"
            className="text-accent-text font-medium transition-colors hover:text-brand-300"
          >
            {t("signInLink")}
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}