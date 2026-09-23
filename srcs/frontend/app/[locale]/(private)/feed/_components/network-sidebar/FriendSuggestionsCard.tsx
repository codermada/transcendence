import { useTranslations } from "next-intl";
import { FriendSuggestionItem } from "./FriendSuggestionItem";
import type { FriendSuggestionsCardProps } from "./network-sidebar.types";

export function FriendSuggestionsCard({
  suggestions = [],
  onSendRequest,
}: FriendSuggestionsCardProps) {
  const t = useTranslations("Feed.network-sidebar.FriendSuggestionsCard");

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/50">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {t("friendSuggestions")}
      </h3>

      {suggestions.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t("noAvailableFriendSuggestions")}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            {t("upToDate")}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {suggestions.map((item) => (
            <FriendSuggestionItem
              key={item.userId}
              userId={item.userId}
              name={item.name}
              image={item.image}
              initials={item.initials}
              mutualFriends={item.mutualFriends}
              onSend={onSendRequest}
            />
          ))}
        </ul>
      )}
    </div>
  );
}