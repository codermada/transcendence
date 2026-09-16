import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const t = await getTranslations("Settings.home");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>

        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      </div>

      {/* your real content here */}
    </div>
  );
}