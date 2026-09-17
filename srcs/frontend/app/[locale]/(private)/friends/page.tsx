import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Users, Inbox } from "@/components/icons";
import { FriendsListClient } from "./FriendsListClient";

export default async function FriendsPage() {
  const t = await getTranslations("Friends");

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header — unchanged */}
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
          <Link
            href="/friends/requests"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
          >
            <Inbox className="h-4 w-4" />
            {t("requests")}
          </Link>

          <button
            type="button"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 cursor-pointer"
          >
            {t("findFriends")}
          </button>
        </div>
      </div>

      {/* The list replaces the old static empty card */}
      <FriendsListClient />
    </div>
  );
}