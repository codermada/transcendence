import { getTranslations } from "next-intl/server";
import { ProfileCard } from "./ProfileCard";

export default async function ProfilePage() {
  const t = await getTranslations("Profile");

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      </header>

      <ProfileCard />
    </div>
  );
}