import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Navbar from "@/components/Nav/Narbar";

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Ambient glow — adapts per theme */}
        <div className="bg-ambient pointer-events-none absolute inset-0 -z-10" />

        <div className="mx-auto max-w-3xl">
          <span className="badge-brand">ft_transcendence</span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            {t("title")}
          </h1>

          <p className="mt-4 text-base text-muted sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/sign-up" className="btn-primary">
              {t("playNow")}
            </Link>
            <Link href="/sign-in" className="btn-secondary">
              {t("signIn")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}