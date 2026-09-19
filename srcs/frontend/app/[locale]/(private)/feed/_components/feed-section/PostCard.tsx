import { PostActions } from "./PostActions";
import { PostHeader } from "./PostHeader";
import { PostMedia } from "./PostMedia";
import type { PostCardProps } from "./feed-section.types";

export function PostCard({
  author,
  initials,
  timeAgo = "À l'instant",
  content,
  likesCount,
  commentsCount,
  mediaUrls,
  children,
}: PostCardProps) {
  return (
    <article className="shadow-2xs space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/50">
      <PostHeader author={author} initials={initials} timeAgo={timeAgo} />
      
      {content && (
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {content}
        </p>
      )}

      <PostMedia mediaUrls={mediaUrls} />

      {children}

      <PostActions likesCount={likesCount} commentsCount={commentsCount} />
    </article>
  );
}