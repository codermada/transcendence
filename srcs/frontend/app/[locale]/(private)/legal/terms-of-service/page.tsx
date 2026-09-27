import { getTranslations } from "next-intl/server";
import Legal from "../page";
export default async function TermsOfServicePage() {
  const t = await getTranslations("TermsOfService");

  return (
    <div className="min-h-screen transition-colors">
      <div className="relative flex min-h-[calc(100vh-4rem)] overflow-hidden">
        <Legal />

        <main className="flex flex-1 flex-col items-center px-6 py-16">
          {/* Ambient glow */}
          <div className="bg-ambient pointer-events-none absolute inset-0 -z-10" />

          <div className="mx-auto w-full max-w-3xl">
            <span className="badge-brand">{t("badge")}</span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {t("title")}
            </h1>

            <p className="text-muted mt-4 text-base sm:text-lg">
              {t("subtitle")}
            </p>

            <div className="text-subtle mt-10 space-y-8 text-sm leading-relaxed">
              <section>
                <h2 className="text-lg font-semibold">{t("section1.title")}</h2>
                <p className="mt-2">{t("section1.body")}</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold">{t("section2.title")}</h2>
                <p className="mt-2">{t("section2.body")}</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold">{t("section3.title")}</h2>
                <p className="mt-2">{t("section3.body")}</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold">{t("section4.title")}</h2>
                <p className="mt-2">{t("section4.body")}</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold">{t("section5.title")}</h2>
                <p className="mt-2">{t("section5.body")}</p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-lg font-semibold">{t("contact.title")}</h2>
                <p className="mt-2">{t("contact.body")}</p>
              </section>
            </div>

            <p className="text-muted mt-12 text-xs">{t("lastUpdated")}</p>
          </div>
        </main>
      </div>
    </div>
  );
}