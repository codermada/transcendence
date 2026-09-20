import { useTranslations } from "next-intl";
import { FriendRequestItem } from "./FriendRequestItem";
import type { FriendRequestsCardProps } from "./network-sidebar.types";

export function FriendRequestsCard({
  receivedRequests = [],
  sentRequests = [],
}: FriendRequestsCardProps) {
  const t = useTranslations("Feed.network-sidebar.FriendRequestsCard");
  const hasRequests = receivedRequests.length > 0 || sentRequests.length > 0;

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/50">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {t("friendRequests")}
      </h3>

      {!hasRequests ? (
        <div className="py-4 text-center">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t("noFriendRequests")}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            {t("upToDate")}
          </p>
        </div>
      ) : (
        <>
          {receivedRequests.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-medium text-violet-600 dark:text-violet-400">
                {receivedRequests.length != 1 ? t("multiReceived") : t("received")} ({receivedRequests.length})
              </span>
              <ul className="space-y-3">
                {receivedRequests.map((req) => (
                  <FriendRequestItem
                    key={req.id}
                    type="received"
                    name={req.name}
                    initials={req.initials}
                  />
                ))}
              </ul>
            </div>
          )}

          {sentRequests.length > 0 && (
            <div className="space-y-2.5 border-t border-zinc-100 pt-2 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {sentRequests.length != 1 ? t("multiSent") : t("sent")} ({sentRequests.length})
              </span>
              <ul className="space-y-2">
                {sentRequests.map((req) => (
                  <FriendRequestItem
                    key={req.id}
                    type="sent"
                    name={req.name}
                    initials={req.initials}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}