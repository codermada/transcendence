"use client";

import { FriendRequestCard } from "./FriendRequestCard";
import type { Friendship, Tab } from "./types";

export function FriendRequestList({
  items,
  viewerId,
  tab,
  pendingId,
  onAccept,
  onReject,
  onCancel,
}: {
  items: Friendship[];
  viewerId: string | null;
  tab: Tab;
  pendingId: string | null;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  return (
    <ul className="space-y-3">
      {items.map((friendship) => (
        <FriendRequestCard
          key={friendship.id}
          friendship={friendship}
          viewerId={viewerId}
          tab={tab}
          isBusy={pendingId === friendship.id}
          onAccept={onAccept}
          onReject={onReject}
          onCancel={onCancel}
        />
      ))}
    </ul>
  );
}