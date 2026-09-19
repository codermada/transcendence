import { PostHeader } from "./PostHeader";
import { PostActions } from "./PostActions";
import type { PostCardProps } from "./feed-section.types";

export function PostCard({
  author,
  initials,
  timeAgo,
  content,
  likesCount,
  commentsCount,
  children,
}: PostCardProps) {
  return (
    <article className="shadow-2xs space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/50">
      <PostHeader author={author} initials={initials} timeAgo={timeAgo} />
      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {content}
      </p>
      {children}
      <PostActions likesCount={likesCount} commentsCount={commentsCount} />
    </article>
  );
}