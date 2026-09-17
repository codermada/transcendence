import { getTranslations } from "next-intl/server";
import { ProfileCard } from "./ProfileCard";

export default async function ProfilePage() {
  const t = await getTranslations("Profile");

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {t("subtitle")}
        </p>
      </header>

      <ProfileCard />
    </div>
  );
}