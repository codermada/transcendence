import { FriendSuggestionItem } from "./FriendSuggestionItem";

export function FriendSuggestionsCard() {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/50">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Suggestions d'amis
      </h3>
      <ul className="space-y-4">
        <FriendSuggestionItem name="Marc Smith" initials="MS" mutualFriends={3} />
        <FriendSuggestionItem name="Sarah Lee" initials="SL" mutualFriends={1} />
      </ul>
    </div>
  );
}