export enum FriendshipStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  BLOCKED = "BLOCKED",
  CANCELLED = "CANCELLED",
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  blockedById: string | null;
  message: string | null;
  pairKey: string;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt: Date | null;
  rejectedAt: Date | null;
  blockedAt: Date | null;
  cancelledAt: Date | null;
}

export interface ProfileHeaderUser {
	id: string;
	name: string;
	avatarUrl: string | null;
	friendsCount: number;
	isOwnProfile: boolean;
	friendshipData?: {
		status: "FRIENDS" | "PENDING_OUTGOING" | "PENDING_INCOMING" | "REJECTED" | "CANCELLED" | "BLOCKED_BY_ME" | "BLOCKED_ME" | null;
		friendship : Friendship | null;
	};
}
