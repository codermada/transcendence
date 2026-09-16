import { getTranslations } from "next-intl/server";
import { NavAuth } from "@/components/Nav/NavAuth";

export default async function FeedPage() {
  const t = await getTranslations("Feed");

  return (
    <main className="min-h-dvh bg-zinc-950 text-white">
      <NavAuth />

      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-zinc-400">{t("welcomeMessage")}</p>
      </div>
    </main>
  );
}
