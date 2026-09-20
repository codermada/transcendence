import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsFilterDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostRepository {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(filters: GetPostsFilterDto, currentUserId: string) {
		const { search } = filters;

		const baseWhere = search
			? {
					content: {
						contains: search,
						mode: 'insensitive' as const,
					},
				}
			: {};

		const includeRelations = {
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
		};

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

		const selectedOlderPosts = shuffledOlderPosts.slice(0, 7);
		const combinedPosts = [...recentPosts, ...selectedOlderPosts];

		return combinedPosts.map((post) => ({
			...post,
			isOwner: post.user.id === currentUserId,
		}));
	}

	async findById(id: string) {
		return this.prisma.post.findUnique({
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
				_count: {
					select: {
						likes: true,
						comments: true,
					},
				},
			},
		});
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
