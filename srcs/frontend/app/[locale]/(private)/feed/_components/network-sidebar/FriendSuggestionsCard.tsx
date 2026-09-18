import { FriendSuggestionItem } from "./FriendSuggestionItem";

interface FriendSuggestionsCardProps {
  suggestions?: Array<{
    id: string;
    name: string;
    initials: string;
    mutualFriends: number;
  }>;
}

export function FriendSuggestionsCard({
  suggestions = [],
}: FriendSuggestionsCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/50">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Suggestions d'amis
      </h3>

      {suggestions.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Aucune suggestion disponible
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            Revenez plus tard pour découvrir de nouveaux profils.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {suggestions.map((item) => (
            <FriendSuggestionItem
              key={item.id}
              name={item.name}
              initials={item.initials}
              mutualFriends={item.mutualFriends}
            />
          ))}
        </ul>
      )}
    </div>
  );
}