import { FriendRequestsCard } from "./FriendRequestsCard";
import { FriendSuggestionsCard } from "./FriendSuggestionsCard";
import type { NetworkSidebarProps } from "./network-sidebar.types";

export function NetworkSidebar({
  receivedRequests = [],
  sentRequests = [],
  suggestions = [],
}: NetworkSidebarProps) {
  return (
    <aside className="custom-scrollbar hidden h-full min-h-0 space-y-4 overflow-y-auto lg:col-span-3 lg:block">
      <FriendRequestsCard
        receivedRequests={receivedRequests}
        sentRequests={sentRequests}
      />
      <FriendSuggestionsCard suggestions={suggestions} />
    </aside>
  );
}