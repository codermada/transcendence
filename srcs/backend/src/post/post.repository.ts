import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsFilterDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostRepository {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(filters: GetPostsFilterDto, currentUserId: string) {
		const { search, limit = 10, offset = 0 } = filters;

		const friendships = await this.prisma.friendship.findMany({
			where: {
				acceptedAt: { not: null },
				OR: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
			},
			select: {
				requesterId: true,
				addresseeId: true,
			},
		});

		const friendIds = friendships.map((f) => (f.requesterId === currentUserId ? f.addresseeId : f.requesterId));

		const allowedUserIds = [currentUserId, ...friendIds];

		const baseWhere = {
			userId: {
				in: allowedUserIds,
			},
			...(search
				? {
						content: {
							contains: search,
							mode: 'insensitive' as const,
						},
					}
				: {}),
		};

		const includeRelations = {
			user: {
				select: {
					id: true,
					name: true,
					pseudo: true,
					image: true,
				},
			},
			likes: {
				where: {
					userId: currentUserId,
				},
				select: {
					userId: true,
				},
			},
			_count: {
				select: {
					likes: true,
					comments: true,
				},
			},
		};

		let posts = [];

		if (offset === 0) {
			const recentPosts = await this.prisma.post.findMany({
				where: baseWhere,
				take: 3,
				orderBy: {
					createdAt: 'desc',
				},
				include: includeRelations,
			});

			const recentIds = recentPosts.map((post) => post.id);

			const olderPosts = await this.prisma.post.findMany({
				where: {
					...baseWhere,
					id: {
						notIn: recentIds,
					},
				},
				take: 50,
				include: includeRelations,
			});

			const shuffledOlderPosts = [...olderPosts];
			for (let i = shuffledOlderPosts.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffledOlderPosts[i], shuffledOlderPosts[j]] = [shuffledOlderPosts[j], shuffledOlderPosts[i]];
			}

			const selectedOlderPosts = shuffledOlderPosts.slice(
				0,
				limit - recentPosts.length > 0 ? limit - recentPosts.length : 7,
			);
			posts = [...recentPosts, ...selectedOlderPosts];
		} else {
			posts = await this.prisma.post.findMany({
				where: baseWhere,
				take: limit,
				skip: offset,
				orderBy: {
					createdAt: 'desc',
				},
				include: includeRelations,
			});
		}

		return posts.map((post) => ({
			...post,
			isOwner: post.user.id === currentUserId,
			isLiked: post.likes.length > 0,
		}));
	}

	async findAssociatedUserIdPosts(filters: GetPostsFilterDto, userId: string, currentUserId: string) {
		const { search } = filters;

		const baseWhere = {
			userId,
			...(search && {
				content: {
					contains: search,
					mode: 'insensitive' as const,
				},
			}),
		};

		const posts = await this.prisma.post.findMany({
			where: baseWhere,
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						pseudo: true,
						image: true,
					},
				},
				likes: {
					where: {
						userId: currentUserId,
					},
					select: {
						userId: true,
					},
				},
				_count: {
					select: {
						likes: true,
						comments: true,
					},
				},
			},
		});

		return posts.map((post) => ({
			...post,
			isOwner: post.user.id === currentUserId,
			isLiked: post.likes.length > 0,
		}));
	}

	async findById(id: string, currentUserId?: string) {
		const post = await this.prisma.post.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						pseudo: true,
						image: true,
					},
				},
				likes: currentUserId
					? {
							where: {
								userId: currentUserId,
							},
							select: {
								userId: true,
							},
						}
					: false,
				_count: {
					select: {
						likes: true,
						comments: true,
					},
				},
			},
		});

		if (!post) return null;

		return {
			...post,
			isOwner: currentUserId ? post.user.id === currentUserId : false,
			isLiked: currentUserId && 'likes' in post ? (post.likes as any[]).length > 0 : false,
		};
	}

	async create(userId: string, dto: CreatePostDto) {
		return this.prisma.post.create({
			data: {
				userId,
				content: dto.content,
				mediaUrls: dto.mediaUrls || [],
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						pseudo: true,
						image: true,
					},
				},
				_count: {
					select: {
						likes: true,
						comments: true,
					},
				},
			},
		});
	}

	async update(id: string, dto: UpdatePostDto) {
		return this.prisma.post.update({
			where: { id },
			data: {
				content: dto.content,
				mediaUrls: dto.mediaUrls,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						pseudo: true,
						image: true,
					},
				},
				_count: {
					select: {
						likes: true,
						comments: true,
					},
				},
			},
		});
	}

	async delete(id: string) {
		return this.prisma.post.delete({
			where: { id },
		});
	}
}
