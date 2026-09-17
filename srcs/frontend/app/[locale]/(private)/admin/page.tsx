// app/admin/page.tsx
import { getTranslations } from "next-intl/server";
import { LayoutDashboard } from "@/components/icons";

export default async function AdminDashboardPage() {
  const t = await getTranslations("Admin.dashboard");

  return (
    <>
      <header className="mb-7 flex items-start gap-4">
        <div
          className="
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-xl
            border border-brand-500/30
            bg-brand-500/10
            text-brand-400
            shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
          "
        >
          <LayoutDashboard className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>
      </header>

      {/* stat cards, recent activity, etc. */}
    </>
  );
}