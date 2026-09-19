import type { FriendSuggestionItemProps } from "./network-sidebar.types";

export function FriendSuggestionItem({
  name,
  initials,
  mutualFriends,
}: FriendSuggestionItemProps) {
  return (
    <li className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {initials}
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {name}
          </p>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
            {mutualFriends} {mutualFriends > 1 ? "amis en commun" : "ami en commun"}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="rounded-lg bg-violet-600/10 px-2.5 py-1 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-600 hover:text-white dark:bg-violet-500/15 dark:text-violet-400 dark:hover:bg-violet-600 dark:hover:text-white"
      >
        Ajouter
      </button>
    </li>
  );
}