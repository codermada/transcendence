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
			email: user.email,
			initials,
			image: user.image,
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
		const friendshipData = await this.profileRepository.getFriendshipStatus(currentUserId, id);

		console.log(friendshipData);

		return {
			id: userProfile.id,
			name: userProfile.name,
			avatarUrl: userProfile.image,
			friendsCount: userProfile.friendsCount,
			isOwnProfile,
			friendshipData,
		};
    }	
}
