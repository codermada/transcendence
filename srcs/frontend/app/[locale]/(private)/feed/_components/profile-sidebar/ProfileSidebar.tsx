import { ProfileCard } from "./ProfileCard";

interface ProfileSidebarProps {
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

export function ProfileSidebar({ user }: ProfileSidebarProps) {
  return (
    <aside className="custom-scrollbar hidden h-full min-h-0 overflow-y-auto lg:col-span-3 lg:block">
      <ProfileCard user={user} />
    </aside>
  );
}