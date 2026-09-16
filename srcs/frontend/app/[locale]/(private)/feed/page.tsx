import { getTranslations } from "next-intl/server";


export default async function FeedPage() {
  const t = await getTranslations("Feed");

  return (
    <main className="min-h-dvh bg-background text-foreground">


      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("welcomeMessage")}</p>
      </div>
    </main>
  );
}