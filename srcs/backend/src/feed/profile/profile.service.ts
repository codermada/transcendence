import {
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { S3Service } from '../../s3/s3.service';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
	constructor(
		private readonly profileRepository: ProfileRepository,
		private readonly s3Service: S3Service,
	) {}

	async getUserProfile(currentUserId: string) {
		const userProfile = await this.profileRepository.getUserProfile(currentUserId);

		return this.formatUserProfile(userProfile);
	}

	private formatUserProfile(user: any) {
		const authorName = user.name || user.pseudo || 'Utilisateur';

		const initials =
			authorName
				.split(' ')
				.filter(Boolean)
				.map((part: string) => part[0])
				.join('')
				.substring(0, 2)
				.toUpperCase() || 'U';

		return {
			id: user.id,
			name: authorName,
			initials,
			authorImage: user.image,
			stats: {
				friendsCount: user.friendsCount,
				postsCount: user.postsCount,
				reactionsCount: user.reactionsCount,
			},
		};
	}

    async getUserProfileById(id: string, currentUserId: string) {
    
        const userProfile = await this.profileRepository.findById(id);

        if (!userProfile) {
            throw new NotFoundException(`User not found with ID: ${id}`);
        }

		const isOwnProfile = (id === currentUserId);
		const friendshipStatus = await this.profileRepository.getFriendshipStatus(currentUserId, id);
		const isFriend = (friendshipStatus === 'FRIENDS');
		const hasPendingOutgoing = (friendshipStatus === 'PENDING_OUTGOING');
		const hasPendingIncoming = (friendshipStatus === 'PENDING_INCOMING');
		const hasRejected = (friendshipStatus === 'REJECTED');
		const hasCancelled = (friendshipStatus === 'CANCELLED');
		const hasBlockedByMe = (friendshipStatus === 'BLOCKED_BY_ME');
		const hasBlockedMe = (friendshipStatus === 'BLOCKED_ME');

		return {
			id: userProfile.id,
			name: userProfile.name,
			avatarUrl: userProfile.image,
			friendsCount: userProfile.friendsCount,
			isOwnProfile,
			isFriend,
			hasPendingOutgoing,
			hasPendingIncoming,
			hasRejected,
			hasCancelled,
			hasBlockedByMe,
			hasBlockedMe,
		};
    }	
}
