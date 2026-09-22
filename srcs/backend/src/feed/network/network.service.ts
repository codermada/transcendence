import { Injectable } from '@nestjs/common';
import { S3Service } from '../../s3/s3.service';
import { NetworkRepository } from './network.repository';

@Injectable()
export class NetworkService {
	constructor(
		private readonly networkRepository: NetworkRepository,
		private readonly s3Service: S3Service,
	) {}

	async getUserNetwork(currentUserId: string) {
		const userNetwork = await this.networkRepository.getUserNetwork(currentUserId);

		return userNetwork;
	}

	async getAllReceivedFriendRequests(currentUserId: string) {
		const receivedFriendRequests = await this.networkRepository.getAllReceivedFriendRequests(currentUserId);

		return receivedFriendRequests;
	}

	async getAllSentFriendRequests(currentUserId: string) {
		const sentFriendRequests = await this.networkRepository.getAllSentFriendRequests(currentUserId);

		return sentFriendRequests;
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
}
