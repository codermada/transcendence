import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function Legal() {
  const tLegal = await getTranslations("Legal");

  return (
    <div className="min-h-screen bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
      <main className="relative flex min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Ambient glow — adapts per theme */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-violet-100/50 via-transparent to-transparent dark:from-violet-950/20 dark:via-transparent dark:to-transparent" />

        <aside className="w-56 shrink-0">
          <div className="mt-12 flex flex-col items-start gap-y-2 px-6 text-xs text-zinc-600 dark:text-zinc-400">
            <Link
              href="/legal/privacy-policy"
              className="underline-offset-4 transition hover:text-violet-400 hover:underline"
            >
              {tLegal("privacyPolicy")}
            </Link>
            <Link
              href="/legal/terms-of-service"
              className="underline-offset-4 transition hover:text-violet-400 hover:underline"
            >
              {tLegal("termsOfService")}
            </Link>
          </div>
        </aside>

        <div className="mx-auto max-w-3xl">
        </div>
      </main>
    </div>
  );
}