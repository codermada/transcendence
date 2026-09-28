import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Nav/Narbar";

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("PrivacyPolicy");

  return (
    <div className="min-h-screen bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
      <Navbar />

      <main className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center overflow-hidden px-6 py-16">
        {/* Ambient glow — adapts per theme */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-violet-100/50 via-transparent to-transparent dark:from-violet-950/20 dark:via-transparent dark:to-transparent" />

        <div className="mx-auto w-full max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            {t("badge")}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            {t("title")}
          </h1>

          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {/* Section 1 */}
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {t("section1.title")}
              </h2>
              <p className="mt-2">{t("section1.body")}</p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {t("section2.title")}
              </h2>
              <p className="mt-2">{t("section2.body")}</p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {t("section3.title")}
              </h2>
              <p className="mt-2">{t("section3.body")}</p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {t("section4.title")}
              </h2>
              <p className="mt-2">{t("section4.body")}</p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {t("section5.title")}
              </h2>
              <p className="mt-2">{t("section5.body")}</p>
            </section>

            {/* Section 6 — Contact */}
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {t("contact.title")}
              </h2>
              <p className="mt-2">{t("contact.body")}</p>
            </section>
          </div>

          <p className="mt-12 text-xs text-zinc-600 dark:text-zinc-400">
            {t("lastUpdated")}
          </p>
        </div>
      </main>
    </div>
  );
}