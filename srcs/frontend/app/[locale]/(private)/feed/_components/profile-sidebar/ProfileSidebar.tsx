import { ProfileCard } from "./ProfileCard";

export function ProfileSidebar() {
  return (
    <aside className="custom-scrollbar hidden h-full min-h-0 overflow-y-auto lg:col-span-3 lg:block">
      <ProfileCard />
    </aside>
  );
}