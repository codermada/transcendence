import { CreatePostCard } from "./CreatePostCard";
import { PostCard } from "./PostCard";

export function FeedSection() {
  return (
    <section className="custom-scrollbar pb-15 h-full min-h-0 space-y-6 overflow-y-auto pr-2 lg:col-span-6">
      <CreatePostCard />

      <PostCard
        author="Jane Doe"
        initials="JD"
        timeAgo="Il y a 2 heures"
        content="Nouvel aperçu du dashboard enfin en ligne ! Dites-moi ce que vous en pensez. 🚀"
        likesCount={24}
        commentsCount={5}
      >
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-zinc-200/60 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/40">
          <span className="text-xs font-medium text-zinc-400">
            Image du post (/uploads)
          </span>
        </div>
      </PostCard>

      <PostCard
        author="Alexandre Laurent"
        initials="AL"
        timeAgo="Il y a 5 heures"
        content="Mise en place réussie de l'architecture avec Next.js et Tailwind CSS ! Prochaine étape : intégration du backend NestJS. 🛠️"
        likesCount={12}
        commentsCount={2}
      />
    </section>
  );
}