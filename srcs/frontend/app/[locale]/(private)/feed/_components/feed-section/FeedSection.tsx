import { CreatePostCard } from "./CreatePostCard";
import { PostCard } from "./PostCard";
import type { FeedSectionProps } from "./feed-section.types";

export function FeedSection({ posts = [] }: FeedSectionProps) {
  return (
    <section className="custom-scrollbar pb-15 h-full min-h-0 space-y-6 overflow-y-auto pr-2 lg:col-span-6">
      <CreatePostCard />

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800/60 dark:text-zinc-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h.01M12 12h.01M12 16.5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Aucun message pour le moment
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Soyez le premier à publier quelque chose ou ajoutez des amis pour voir leurs actualités.
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            author={post.author}
            initials={post.initials}
            timeAgo={post.timeAgo}
            content={post.content}
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
          />
        ))
      )}
    </section>
  );
}