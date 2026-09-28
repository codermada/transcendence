import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function Legal() {
  const tLegal = await getTranslations("Legal");

  return (
    <div className="min-h-screen transition-colors">

      <main className="relative flex min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Ambient glow */}
        <div className="bg-ambient pointer-events-none absolute inset-0 -z-10" />

        <aside className="w-56 shrink-0">
          <div className="text-muted mt-12 flex flex-col items-start gap-y-2 px-6 text-xs">
            <Link
              href="/legal/privacy-policy"
              className="underline-offset-4 transition hover:text-brand-400 hover:underline"
            >
              {tLegal("privacyPolicy")}
            </Link>
            <Link
              href="/legal/terms-of-service"
              className="underline-offset-4 transition hover:text-brand-400 hover:underline"
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