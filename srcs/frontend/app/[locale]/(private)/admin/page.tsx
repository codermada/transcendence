import { LayoutDashboard } from "@/components/icons";
import { UserCountCard } from "@/components/admin/UserCountCard";
import { getTranslations } from "next-intl/server";

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
            border border-violet-500/30
            bg-violet-50 text-violet-600
            shadow-sm transition-colors
            dark:bg-violet-500/10 dark:text-violet-400
            dark:shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
          "
        >
          <LayoutDashboard className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("subtitle")}
          </p>
          <UserCountCard />
        </div>
      </header>
    </>
  );
}