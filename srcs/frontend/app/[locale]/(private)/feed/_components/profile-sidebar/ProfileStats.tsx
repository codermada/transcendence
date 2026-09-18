interface ProfileStatsProps {
  friendsCount?: number;
  postsCount?: number;
  reactionsCount?: number;
}

export function ProfileStats({
  friendsCount = 0,
  postsCount = 0,
  reactionsCount = 0,
}: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div>
        <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          Amis
        </span>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {friendsCount}
        </span>
      </div>
      <div className="border-x border-zinc-100 dark:border-zinc-800/80">
        <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          Posts
        </span>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {postsCount}
        </span>
      </div>
      <div>
        <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          Réactions
        </span>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {reactionsCount}
        </span>
      </div>
    </div>
  );
}