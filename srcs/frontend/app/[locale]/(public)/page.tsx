import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Navbar from "@/components/Nav/Narbar";

export default async function Home() {
  const t = await getTranslations("Home");
  const tLegal = await getTranslations("Legal");

  return (
    <div className="min-h-screen bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
      <Navbar />

      <main className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Ambient glow — adapts per theme */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-violet-100/50 via-transparent to-transparent dark:from-violet-950/20 dark:via-transparent dark:to-transparent" />

        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            ft_transcendence
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
            {t("title")}
          </h1>

          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/sign-up" 
              className="rounded-full bg-violet-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-500 active:bg-violet-700"
            >
              {t("playNow")}
            </Link>
            <Link 
              href="/sign-in" 
              className="rounded-full border border-zinc-200 bg-zinc-50 px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
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