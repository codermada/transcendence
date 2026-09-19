import type { PostHeaderProps } from "./feed-section.types";

export function PostHeader({ author, initials, timeAgo }: PostHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {initials}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {author}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
}