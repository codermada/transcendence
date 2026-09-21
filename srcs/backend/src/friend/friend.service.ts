import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Friendship, FriendshipStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BlockUserDto } from './dto/block-user.dto';
import { CreateFriendDto } from './dto/create-friend.dto';
import { ListFriendshipsQueryDto } from './dto/list-friendships-query.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { buildPairKey } from './utils/pair-key.util';

// Reusable public user projection.
const FRIEND_USER_SELECT = {
	id: true,
	name: true,
	pseudo: true,
	image: true,
} as const;

// Full friendship shape returned to clients.
const FRIENDSHIP_INCLUDE = {
	requester: { select: FRIEND_USER_SELECT },
	addressee: { select: FRIEND_USER_SELECT },
	blockedBy: { select: FRIEND_USER_SELECT },
} satisfies Prisma.FriendshipInclude;

@Injectable()
export class FriendService {
	constructor(private readonly prisma: PrismaService) {}

	async create(currentUserId: string, dto: CreateFriendDto) {
		const { addresseeId, message } = dto;

		if (currentUserId === addresseeId) {
			throw new BadRequestException('You cannot send a friend request to yourself');
		}

		const addressee = await this.prisma.user.findUnique({
			where: { id: addresseeId },
			select: { id: true, banned: true },
		});

		if (!addressee) {
			throw new NotFoundException('Target user not found');
		}
		if (addressee.banned) {
			throw new ForbiddenException('Target user is banned');
		}

		const pairKey = buildPairKey(currentUserId, addresseeId);
		const existing = await this.prisma.friendship.findUnique({ where: { pairKey } });

		if (existing) {
			if (existing.status === FriendshipStatus.ACCEPTED) {
				throw new ConflictException('You are already friends with this user');
			}
			if (existing.status === FriendshipStatus.PENDING) {
				// If the other user already sent us a request, accept it instead.
				if (existing.requesterId === addresseeId) {
					return this.prisma.friendship.update({
						where: { id: existing.id },
						data: {
							status: FriendshipStatus.ACCEPTED,
							acceptedAt: new Date(),
							message: message ?? existing.message,
						},
						include: FRIENDSHIP_INCLUDE,
					});
				}
				throw new ConflictException('A friend request is already pending');
			}
			if (existing.status === FriendshipStatus.BLOCKED) {
				throw new ForbiddenException('This relationship is blocked');
			}
			// REJECTED / CANCELLED → allow re-sending by resetting the row.
			return this.prisma.friendship.update({
				where: { id: existing.id },
				data: {
					status: FriendshipStatus.PENDING,
					requesterId: currentUserId,
					addresseeId,
					blockedById: null,
					message: message ?? null,
					acceptedAt: null,
					rejectedAt: null,
					blockedAt: null,
					cancelledAt: null,
				},
				include: FRIENDSHIP_INCLUDE,
			});
		}

		return this.prisma.friendship.create({
			data: {
				requesterId: currentUserId,
				addresseeId,
				pairKey,
				message: message ?? null,
				status: FriendshipStatus.PENDING,
			},
			include: FRIENDSHIP_INCLUDE,
		});
	}

	async findAll(currentUserId: string, query: ListFriendshipsQueryDto) {
		const { status, page = 1, limit = 20, search } = query;
		const skip = (page - 1) * limit;

		const where: Prisma.FriendshipWhereInput = {
			OR: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
			...(status && { status }),
			...(search && {
				AND: [
					{
						OR: [
							{ requester: { name: { contains: search, mode: 'insensitive' } } },
							{ requester: { pseudo: { contains: search, mode: 'insensitive' } } },
							{ addressee: { name: { contains: search, mode: 'insensitive' } } },
							{ addressee: { pseudo: { contains: search, mode: 'insensitive' } } },
						],
					},
				],
			}),
		};

		const [items, total] = await this.prisma.$transaction([
			this.prisma.friendship.findMany({
				where,
				include: FRIENDSHIP_INCLUDE,
				orderBy: { updatedAt: 'desc' },
				skip,
				take: limit,
			}),
			this.prisma.friendship.count({ where }),
		]);

		return {
			data: items,
			meta: { total, page, limit, pages: Math.ceil(total / limit) },
		};
	}

	async listFriends(currentUserId: string, query: ListFriendshipsQueryDto) {
		return this.findAll(currentUserId, { ...query, status: FriendshipStatus.ACCEPTED });
	}

	async listIncomingRequests(currentUserId: string, query: ListFriendshipsQueryDto) {
		const { page = 1, limit = 20 } = query;
		const skip = (page - 1) * limit;

		const where: Prisma.FriendshipWhereInput = {
			addresseeId: currentUserId,
			status: FriendshipStatus.PENDING,
		};

		const [items, total] = await this.prisma.$transaction([
			this.prisma.friendship.findMany({
				where,
				include: FRIENDSHIP_INCLUDE,
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			}),
			this.prisma.friendship.count({ where }),
		]);

		return { data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
	}

	async listOutgoingRequests(currentUserId: string, query: ListFriendshipsQueryDto) {
		const { page = 1, limit = 20 } = query;
		const skip = (page - 1) * limit;

		const where: Prisma.FriendshipWhereInput = {
			requesterId: currentUserId,
			status: FriendshipStatus.PENDING,
		};

		const [items, total] = await this.prisma.$transaction([
			this.prisma.friendship.findMany({
				where,
				include: FRIENDSHIP_INCLUDE,
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			}),
			this.prisma.friendship.count({ where }),
		]);

		return { data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
	}

	async listBlocked(currentUserId: string, query: ListFriendshipsQueryDto) {
		const { page = 1, limit = 20 } = query;
		const skip = (page - 1) * limit;

		const where: Prisma.FriendshipWhereInput = {
			status: FriendshipStatus.BLOCKED,
			OR: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
		};

		const [items, total] = await this.prisma.$transaction([
			this.prisma.friendship.findMany({
				where,
				include: FRIENDSHIP_INCLUDE,
				orderBy: { blockedAt: 'desc' },
				skip,
				take: limit,
			}),
			this.prisma.friendship.count({ where }),
		]);

		return { data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
	}

	async findOne(currentUserId: string, id: string) {
		const friendship = await this.prisma.friendship.findUnique({
			where: { id },
			include: FRIENDSHIP_INCLUDE,
		});

		if (!friendship) {
			throw new NotFoundException('Friendship not found');
		}

		this.assertParticipant(currentUserId, friendship);

		return friendship;
	}

	async findByUserId(currentUserId: string, otherUserId: string) {
		const pairKey = buildPairKey(currentUserId, otherUserId);
		const friendship = await this.prisma.friendship.findUnique({
			where: { pairKey },
			include: FRIENDSHIP_INCLUDE,
		});

		if (!friendship) {
			throw new NotFoundException('Friendship not found');
		}

		this.assertParticipant(currentUserId, friendship);

		return friendship;
	}

	async update(currentUserId: string, id: string, dto: UpdateFriendDto) {
		const friendship = await this.loadOrThrow(id);
		this.assertParticipant(currentUserId, friendship);

		return this.prisma.friendship.update({
			where: { id },
			data: {
				...(dto.message !== undefined && { message: dto.message }),
			},
			include: FRIENDSHIP_INCLUDE,
		});
	}

	async accept(currentUserId: string, id: string) {
		const friendship = await this.loadOrThrow(id);
		this.assertParticipant(currentUserId, friendship);

		if (friendship.status !== FriendshipStatus.PENDING) {
			throw new BadRequestException('Only pending requests can be accepted');
		}
		if (friendship.addresseeId !== currentUserId) {
			throw new ForbiddenException('Only the addressee can accept this request');
		}

		return this.prisma.friendship.update({
			where: { id },
			data: { status: FriendshipStatus.ACCEPTED, acceptedAt: new Date() },
			include: FRIENDSHIP_INCLUDE,
		});
	}

	async reject(currentUserId: string, id: string) {
		const friendship = await this.loadOrThrow(id);
		this.assertParticipant(currentUserId, friendship);

		if (friendship.status !== FriendshipStatus.PENDING) {
			throw new BadRequestException('Only pending requests can be rejected');
		}
		if (friendship.addresseeId !== currentUserId) {
			throw new ForbiddenException('Only the addressee can reject this request');
		}

		return this.prisma.friendship.delete({
			where: { id },
		});
	}

	async cancel(currentUserId: string, id: string) {
		const friendship = await this.loadOrThrow(id);
		this.assertParticipant(currentUserId, friendship);

		if (friendship.status !== FriendshipStatus.PENDING) {
			throw new BadRequestException('Only pending requests can be cancelled');
		}
		if (friendship.requesterId !== currentUserId) {
			throw new ForbiddenException('Only the requester can cancel this request');
		}

		return this.prisma.friendship.delete({
			where: { id },
		});
	}

	async removeFriend(currentUserId: string, id: string) {
		const friendship = await this.loadOrThrow(id);
		this.assertParticipant(currentUserId, friendship);

		if (friendship.status !== FriendshipStatus.ACCEPTED) {
			throw new BadRequestException('Only accepted friendships can be removed');
		}

		return this.prisma.friendship.delete({
			where: { id },
		});
	}

	async block(currentUserId: string, dto: BlockUserDto) {
		const { userId: targetUserId, reason } = dto;

		if (!targetUserId) {
			throw new BadRequestException('userId is required');
		}
		if (currentUserId === targetUserId) {
			throw new BadRequestException('You cannot block yourself');
		}

		const target = await this.prisma.user.findUnique({
			where: { id: targetUserId },
			select: { id: true },
		});
		if (!target) {
			throw new NotFoundException('Target user not found');
		}

		const pairKey = buildPairKey(currentUserId, targetUserId);
		const existing = await this.prisma.friendship.findUnique({ where: { pairKey } });

		if (existing) {
			if (existing.status === FriendshipStatus.BLOCKED && existing.blockedById === currentUserId) {
				throw new ConflictException('You have already blocked this user');
			}
			return this.prisma.friendship.update({
				where: { id: existing.id },
				data: {
					status: FriendshipStatus.BLOCKED,
					blockedById: currentUserId,
					blockedAt: new Date(),
					message: reason ?? existing.message,
				},
				include: FRIENDSHIP_INCLUDE,
			});
		}

		return this.prisma.friendship.create({
			data: {
				requesterId: currentUserId,
				addresseeId: targetUserId,
				pairKey,
				status: FriendshipStatus.BLOCKED,
				blockedById: currentUserId,
				blockedAt: new Date(),
				message: reason ?? null,
			},
			include: FRIENDSHIP_INCLUDE,
		});
	}

	async unblock(currentUserId: string, id: string) {
		const friendship = await this.loadOrThrow(id);
		this.assertParticipant(currentUserId, friendship);

		if (friendship.status !== FriendshipStatus.BLOCKED) {
			throw new BadRequestException('This relationship is not blocked');
		}
		if (friendship.blockedById !== currentUserId) {
			throw new ForbiddenException('Only the user who blocked can unblock');
		}

		return this.prisma.friendship.update({
			where: { id },
			data: {
				status: FriendshipStatus.CANCELLED,
				blockedById: null,
				cancelledAt: new Date(),
			},
			include: FRIENDSHIP_INCLUDE,
		});
	}

	async remove(currentUserId: string, id: string) {
		const friendship = await this.loadOrThrow(id);
		this.assertParticipant(currentUserId, friendship);

		await this.prisma.friendship.delete({ where: { id } });
		return { success: true, id };
	}

	private async loadOrThrow(id: string): Promise<Friendship> {
		const friendship = await this.prisma.friendship.findUnique({ where: { id } });
		if (!friendship) {
			throw new NotFoundException('Friendship not found');
		}
		return friendship;
	}

	private assertParticipant(userId: string, friendship: Friendship): void {
		if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
			throw new NotFoundException('Friendship not found');
		}
	}
}
