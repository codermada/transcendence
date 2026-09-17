import { getTranslations } from "next-intl/server";
import { Users } from "@/components/icons";

export default async function FriendsPage() {
  const t = await getTranslations("Friends");

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-5 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 cursor-pointer"
          >
            {t("findFriends")}
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-white/80 p-10 text-center shadow-xs backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-violet-600 ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:text-violet-400/70 dark:ring-zinc-800">
          <Users className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
          {t("emptyTitle")}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          {t("emptyDescription")}
        </p>
      </div>
    </div>
  );
}