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
}
