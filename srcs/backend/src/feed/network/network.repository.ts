import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NetworkRepository {
	constructor(private readonly prisma: PrismaService) {}

	async getAllReceivedFriendRequests(currentUserId: string) {
		return await this.prisma.friendship.findMany({
			where: {
				addresseeId: currentUserId,
				acceptedAt: null,
			},
			orderBy: {
				createdAt: 'desc',
			},
			select: {
				id: true,
				requester: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
			},
		});
	}

	async getAllSentFriendRequests(currentUserId: string) {
		return await this.prisma.friendship.findMany({
			where: {
				requesterId: currentUserId,
				acceptedAt: null,
			},
			orderBy: {
				createdAt: 'desc',
			},
			select: {
				id: true,
				addressee: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
			},
		});
	}

	private async getFriendIds(userId: string): Promise<string[]> {
		const friendships = await this.prisma.friendship.findMany({
			where: {
				acceptedAt: { not: null },
				OR: [{ requesterId: userId }, { addresseeId: userId }],
			},
			select: {
				requesterId: true,
				addresseeId: true,
			},
		});

		return friendships.map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId));
	}

	async getFriendSuggestions(currentUserId: string, limit = 3) {
		const existingRelations = await this.prisma.friendship.findMany({
			where: {
				OR: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
			},
			select: {
				requesterId: true,
				addresseeId: true,
			},
		});

		const excludedUserIds = new Set<string>([
			currentUserId,
			...existingRelations.map((r) => (r.requesterId === currentUserId ? r.addresseeId : r.requesterId)),
		]);

		const currentUserFriendIds = await this.getFriendIds(currentUserId);

		const candidates = await this.prisma.user.findMany({
			where: {
				id: { notIn: Array.from(excludedUserIds) },
			},
			select: {
				id: true,
				name: true,
				image: true,
			},
			take: limit * 2,
		});

		if (candidates.length === 0) {
			return [];
		}

		const suggestionsWithMutualCount = await Promise.all(
			candidates.map(async (candidate) => {
				const candidateFriendIds = await this.getFriendIds(candidate.id);

				const mutualFriendsCount = candidateFriendIds.filter((friendId) =>
					currentUserFriendIds.includes(friendId),
				).length;

				const initials = candidate.name
					? candidate.name
							.split(' ')
							.map((n) => n[0])
							.join('')
							.toUpperCase()
							.slice(0, 2)
					: '??';

				return {
					id: candidate.id,
					userId: candidate.id,
					name: candidate.name,
					initials,
					mutualFriends: mutualFriendsCount,
				};
			}),
		);

		return suggestionsWithMutualCount.sort((a, b) => b.mutualFriends - a.mutualFriends).slice(0, limit);
	}

	async getUserNetwork(currentUserId: string) {
		const receivedFriendRequests = await this.getAllReceivedFriendRequests(currentUserId);
		const sentFriendRequests = await this.getAllSentFriendRequests(currentUserId);
		const suggestions = await this.getFriendSuggestions(currentUserId);

		return {
			receivedFriendRequests,
			sentFriendRequests,
			suggestions,
		};
	}
}
