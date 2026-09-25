import { getTranslations } from "next-intl/server";
import { Inbox } from "@/components/icons";
import { FriendRequestsClient } from "./FriendRequestsClient";

export default async function FriendRequestsPage() {
  const t = await getTranslations("FriendRequests");

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-5 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
            <Inbox className="h-6 w-6" />
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
      </div>

      <FriendRequestsClient />
    </div>
  );
}