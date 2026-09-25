import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfileRepository {
	constructor(private readonly prisma: PrismaService) {}

	async countUserFriends(currentUserId: string) {
		return await this.prisma.friendship.count({
			where: {
				AND: [
					{
						NOT: {
							acceptedAt: null,
						},
					},
					{
						OR: [
							{
								requesterId: currentUserId,
							},
							{
								addresseeId: currentUserId,
							},
						],
					},
				],
			},
		});
	}

	async countUserPosts(currentUserId: string) {
		return await this.prisma.post.count({
			where: {
				user: {
					id: currentUserId,
				},
			},
		});
	}

	async countUserLikes(currentUserId: string) {
		return await this.prisma.userPostLike.count({
			where: {
				user: {
					id: currentUserId,
				},
			},
		});
	}

	async getUserProfile(currentUserId: string) {
		const userInfo = await this.prisma.user.findUnique({
			where: {
				id: currentUserId,
			},
		});

		const friendsCount = await this.countUserFriends(currentUserId);
		const postsCount = await this.countUserPosts(currentUserId);
		const reactionsCount = await this.countUserLikes(currentUserId);

		return {
			...userInfo,
			friendsCount,
			postsCount,
			reactionsCount,
		};
	}

    async findById(id: string) {

		const userInfo = await this.prisma.user.findUnique({
			where: { id },
		});

		if (!userInfo) {
			return null;
		}

		const friendsCount = await this.countUserFriends(id);

		return {
			...userInfo,
			friendsCount,
		};
	}

	async getFriendshipStatus(currentUserId: string, otherUserId: string) {
		if (currentUserId === otherUserId) {
			return 'SELF';
		}

		const pairKey = [currentUserId, otherUserId].sort().join(':');

		const friendship = await this.prisma.friendship.findUnique({
			where: { pairKey },
			select: {
			id: true,
			status: true,
			requesterId: true,
			addresseeId: true,
			blockedById: true,
			},
		});

		if (!friendship) {
			return 'none';
		}

		switch (friendship.status) {
			case 'PENDING': {
			return friendship.requesterId === currentUserId
				? 'PENDING_OUTGOING'
				: 'PENDING_INCOMING';
			}

			case 'ACCEPTED':
				return 'FRIENDS';

			case 'BLOCKED': {
			const blockerId = friendship.blockedById ?? friendship.requesterId;
			return blockerId === currentUserId
				? 'BLOCKED_BY_ME'
				: 'BLOCKED_ME';
			}

			case 'REJECTED':
			return 'REJECTED';

			case 'CANCELLED':
			return 'CANCELLED';

			default:
			return 'NONE';
		}
	}
}