import { getTranslations } from "next-intl/server";


export default async function FeedPage() {
  const t = await getTranslations("Feed");

  return (
    <main className="min-h-dvh bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {t("welcomeMessage")}
        </p>
      </div>
    </main>
  );
}