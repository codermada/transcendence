import { FriendRequestsCard } from "./FriendRequestsCard";
import { FriendSuggestionsCard } from "./FriendSuggestionsCard";

export function NetworkSidebar() {
  return (
    <aside className="custom-scrollbar hidden h-full min-h-0 space-y-4 overflow-y-auto lg:col-span-3 lg:block">
      <FriendRequestsCard />
      <FriendSuggestionsCard />
    </aside>
  );
}