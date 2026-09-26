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
			return {
				status: 'SELF',
				friendship: null,
			};
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
			return {
				status: 'NONE',
				id: null,
			};
		}

		let status: string;

		switch (friendship.status) {
			case 'PENDING': {
				if (friendship.requesterId === currentUserId) {
					status = 'PENDING_OUTGOING';
				} else {
					status = 'PENDING_INCOMING';
				}

				break;
			}

			case 'ACCEPTED': {
				status = 'FRIENDS';
				break;
			}

			case 'BLOCKED': {
				const blockerId =
					friendship.blockedById ?? friendship.requesterId;

				if (blockerId === currentUserId) {
					status = 'BLOCKED_BY_ME';
				} else {
					status = 'BLOCKED_BY_OTHER';
				}

				break;
			}

			case 'REJECTED': {
				status = 'REJECTED';
				break;
			}

			case 'CANCELLED': {
				status = 'CANCELLED';
				break;
			}

			default: {
				status = 'NONE';
				break;
			}
		}

		return {
			status,
			friendship,
		};
	}
}
