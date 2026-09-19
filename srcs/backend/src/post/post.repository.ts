import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsFilterDto } from './dto/get-posts.dto';

@Injectable()
export class PostRepository {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(filters: GetPostsFilterDto) {
		const { search, limit = 20, offset = 0 } = filters;

		return this.prisma.post.findMany({
			where: search
				? {
						content: {
							contains: search,
							mode: 'insensitive',
						},
					}
				: {},
			take: Number(limit),
			skip: Number(offset),
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
				_count: {
					select: {
						likes: true,
						comments: true,
					},
				},
			},
		});
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
}
