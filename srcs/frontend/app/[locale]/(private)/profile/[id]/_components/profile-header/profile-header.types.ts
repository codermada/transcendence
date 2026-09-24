
export interface ProfileHeaderUser {
			id: string;
			name: string;
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
}