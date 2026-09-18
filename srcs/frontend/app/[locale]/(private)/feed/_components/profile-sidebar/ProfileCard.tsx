import { Link } from "@/i18n/routing";
import { ProfileStats } from "./ProfileStats";

export interface ProfileCardProps {
  user: {
    name: string;
    username: string;
    initials: string;
    stats: {
      friendsCount: number;
      postsCount: number;
      reactionsCount: number;
    };
  };
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/50">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-500/30 bg-violet-600/20 font-semibold text-violet-500 dark:text-violet-400">
          {user.initials}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {user.name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">@{user.username}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <ProfileStats
          friendsCount={user.stats.friendsCount}
          postsCount={user.stats.postsCount}
          reactionsCount={user.stats.reactionsCount}
        />
        <Link
          href="/profile"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-violet-500/30 hover:bg-violet-50 hover:text-violet-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Mon Profil</span>
        </Link>
      </div>
    </div>
  );
}