import { getTranslations } from "next-intl/server";
import { PublicProfileCard } from "./PublicProfileCard";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("PublicProfile");

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      </header>

      <PublicProfileCard userId={id} />
    </div>
  );
}