import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NetworkRepository {
	constructor(private readonly prisma: PrismaService) {}

	async getAllReceivedFriendRequests(currentUserId: string) {
		const includeRelations = {
			requester: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		};

		return await this.prisma.friendship.findMany({
			where: {
				addresseeId: currentUserId,
			},
			orderBy: {
				createdAt: 'desc',
			},
			include: includeRelations,
			omit: {
				acceptedAt: true,
				rejectedAt: true,
				addresseeId: true,
				blockedAt: true,
				blockedById: true,
				cancelledAt: true,
				createdAt: true,
				message: true,
				pairKey: true,
				requesterId: true,
				status: true,
				updatedAt: true,
			},
		});
	}

	async getAllSentFriendRequests(currentUserId: string) {
		const includeRelations = {
			addressee: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		};

		return await this.prisma.friendship.findMany({
			where: {
				requesterId: currentUserId,
			},
			orderBy: {
				createdAt: 'desc',
			},
			include: includeRelations,
			omit: {
				acceptedAt: true,
				rejectedAt: true,
				addresseeId: true,
				blockedAt: true,
				blockedById: true,
				cancelledAt: true,
				createdAt: true,
				message: true,
				pairKey: true,
				requesterId: true,
				status: true,
				updatedAt: true,
			},
		});
	}

	async getAllFriendSuggestions(currentUserId: string) {
		return await this.prisma.userPostLike.count({
			where: {
				user: {
					id: currentUserId,
				},
			},
		});
	}

	async getUserNetwork(currentUserId: string) {
		const receivedFriendRequests = await this.getAllReceivedFriendRequests(currentUserId);
		const sentFriendRequests = await this.getAllSentFriendRequests(currentUserId);

		return {
			receivedFriendRequests,
			sentFriendRequests,
		};
	}
}
