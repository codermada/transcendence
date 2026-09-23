import { ProfileCard } from "./ProfileCard";
import type { ProfileSidebarProps } from "./profile-sidebar.types";

export function ProfileSidebar({ user }: ProfileSidebarProps) {
  return (
    <aside className="custom-scrollbar hidden h-full min-h-0 overflow-y-auto lg:col-span-3 lg:block">
      <ProfileCard user={user} />
    </aside>
  );
}