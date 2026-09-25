export type FriendUser = {
  id: string;
  name: string | null;
  pseudo: string | null;
  image: string | null;
};

export type FriendshipStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "BLOCKED"
  | "CANCELLED";

export type Friendship = {
  id: string;
  status: FriendshipStatus;
  requesterId: string;
  addresseeId: string;
  message: string | null;
  createdAt: string;
  requester: FriendUser;
  addressee: FriendUser;
};

export type Page<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
};

export type Tab = "incoming" | "outgoing";

export const FRIEND_API = {
  me: () => `/nest/user/me`,
  incoming: (page = 1, limit = 50) =>
    `/nest/friend/requests/incoming?page=${page}&limit=${limit}`,
  outgoing: (page = 1, limit = 50) =>
    `/nest/friend/requests/outgoing?page=${page}&limit=${limit}`,
  accept: (id: string) => `/nest/friend/${id}/accept`,
  reject: (id: string) => `/nest/friend/${id}/reject`,
  cancel: (id: string) => `/nest/friend/${id}/cancel`,
} as const;

/**
 * Picks the "other side" of a friendship, i.e. the user who is NOT me.
 * Falls back to the tab semantics when `viewerId` is unknown.
 */
export function pickOther(
  friendship: Friendship,
  viewerId: string | null,
  tab: Tab,
): FriendUser {
  if (viewerId) {
    if (friendship.requesterId === viewerId) return friendship.addressee;
    if (friendship.addresseeId === viewerId) return friendship.requester;
  }
  return tab === "incoming" ? friendship.requester : friendship.addressee;
}