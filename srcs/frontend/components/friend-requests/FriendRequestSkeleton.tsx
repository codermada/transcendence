export function FriendRequestSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
            <div className="h-9 w-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </li>
      ))}
    </ul>
  );
}