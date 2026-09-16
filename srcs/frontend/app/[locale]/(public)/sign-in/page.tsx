import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";

export default async function SignInPage() {
  const t = await getTranslations("Auth.signIn");

  return (
    <AuthCard
      title={
        <>
          {t("title")}
        </>
      }
      subtitle={t("subtitle")}
      footer={
        <p>
          {t("noAccount")}{" "}
          <Link href="/sign-up" className="text-violet-400 hover:text-violet-300">
            {t("signUpLink")}
          </Link>
        </p>
      }
    >
      <SignInForm />
    </AuthCard>
  );
}
