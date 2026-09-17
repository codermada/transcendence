import { getTranslations } from "next-intl/server";
import { Users } from "@/components/icons";

export default async function FriendsPage() {
  const t = await getTranslations("Friends");

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
            <p className="text-sm text-zinc-400">{t("subtitle")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            {t("findFriends")}
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-violet-400/70 ring-1 ring-zinc-800">
          <Users className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-white">
          {t("emptyTitle")}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
          {t("emptyDescription")}
        </p>
      </div>
    </div>
  );
}
