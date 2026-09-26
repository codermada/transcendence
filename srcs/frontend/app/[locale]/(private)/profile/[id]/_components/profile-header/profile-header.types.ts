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
			conversationId: string;
			name: string;
			image: string | null
			avatarUrl: string | null;
			friendsCount: number;
			isOwnProfile: boolean;
			isFriend: boolean;
			hasPendingOutgoing: boolean;
			hasPendingIncoming: boolean;
			hasRejected: boolean;
			hasCancelled: boolean;
			hasBlockedByMe: boolean;
			hasBlockedMe: boolean;
			isSelf: boolean;
			city: string;
			friendshipData?: {
				status: "FRIENDS" | "PENDING_OUTGOING" | "PENDING_INCOMING" | "REJECTED" | "CANCELLED" | "BLOCKED_BY_ME" | "BLOCKED_ME" | null;
				friendship : Friendship | null;
			};

}
