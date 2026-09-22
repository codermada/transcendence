import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostLikeRepository {
	constructor(private readonly prisma: PrismaService) {}

	async findLike(userId: string, postId: string) {
		return this.prisma.userPostLike.findUnique({
			where: {
				userId_postId: {
					userId,
					postId,
				},
			},
		});
	}

	async createLike(userId: string, postId: string) {
		return this.prisma.userPostLike.create({
			data: {
				userId,
				postId,
			},
		});
	}

	async deleteLike(userId: string, postId: string) {
		return this.prisma.userPostLike.delete({
			where: {
				userId_postId: {
					userId,
					postId,
				},
			},
		});
	}

	async countByPostId(postId: string): Promise<number> {
		return this.prisma.userPostLike.count({
			where: { postId },
		});
	}

	async findPostById(postId: string) {
		return this.prisma.post.findUnique({
			where: { id: postId },
			select: { id: true },
		});
	}
}
