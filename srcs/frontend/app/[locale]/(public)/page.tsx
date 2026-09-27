import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Navbar from "@/components/Nav/Narbar";

export default async function Home() {
  const t = await getTranslations("Home");
  const tLegal = await getTranslations("Legal");

  return (
    <div className="min-h-screen transition-colors">
      <Navbar />

      <main className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Ambient glow */}
        <div className="bg-ambient pointer-events-none absolute inset-0 -z-10" />

        <div className="mx-auto max-w-3xl">
          <span className="badge-brand">ft_transcendence</span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            {t("title")}
          </h1>

          <p className="text-muted mt-4 text-base sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/sign-up" className="btn-primary rounded-full">
              {t("playNow")}
            </Link>
            <Link href="/sign-in" className="btn-secondary rounded-full">
              {t("signIn")}
            </Link>
          </div>

          {/* Legal links */}
          <div className="text-muted mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
            <Link
              href="/privacy-policy"
              className="underline-offset-4 transition hover:text-brand-400 hover:underline"
            >
              {tLegal("privacyPolicy")}
            </Link>
            <span aria-hidden className="hidden sm:inline">
              ·
            </span>
            <Link
              href="/terms-of-service"
              className="underline-offset-4 transition hover:text-brand-400 hover:underline"
            >
              {tLegal("termsOfService")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}