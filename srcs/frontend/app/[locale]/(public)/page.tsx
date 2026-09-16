import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Navbar from "@/components/Nav/Narbar";

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-zinc-950 to-zinc-950" />

        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
            ft_transcendence
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            {t("title")}
          </h1>

          <p className="mt-4 text-base text-zinc-400 sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500"
            >
              {t("playNow")}
            </Link>

            <Link
              href="/sign-in"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
