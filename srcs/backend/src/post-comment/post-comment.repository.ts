import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostCommentRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findCommentsByPostId(postId: string) {
        const  comments = await this.prisma.comment.findMany({
            where: { postId },

            orderBy: {
                createdAt: 'desc',
            },

            select: {
                id: true,
                userId: true,
                content: true,
                mediaUrl: true,
                createdAt: true,
                updatedAt: true,

                post : {
                    select: {
                        userId: true,
                    },
                },

                user: {
                    select: {
                        name: true,
                        pseudo: true,
                        image: true,
                    },
                },

                _count: {
                    select: {
                        likes: true,
                    },
                },
                likes: {
                    select: {
                        userId: true,
                        commentId: true,
                        createdAt: true,
                    },
                },
            },
        });
        return comments;
    }

    async create(user: any, dto: any) {
        const createdComment = await this.prisma.comment.create({
            data: {
                userId: user,
                postId: dto.postId,
                content: dto.content,
                mediaUrl: dto.mediaUrl || null,
            },
            select: {
                id: true,
                userId: true,
                content: true,
                mediaUrl: true,
                createdAt: true,
                updatedAt: true,

                post : {
                    select: {
                        userId: true,
                    },
                },

                user: {
                    select: {
                        name: true,
                        pseudo: true,
                        image: true,
                    },
                },

                _count: {
                    select: {
                        likes: true,
                    },
                },
                likes: {
                    select: {
                        userId: true,
                        commentId: true,
                        createdAt: true,
                    },
                },
            },
        });

        return createdComment;
    }

    async findCommentById(commentId: string) {
        return this.prisma.comment.findUnique({
            where: { id: commentId },
            select: {
                id: true,
                userId: true,
                content: true,
                mediaUrl: true,
                createdAt: true,
                updatedAt: true,

                post : {
                    select: {
                        userId: true,
                    },
                },

                user: {
                    select: {
                        name: true,
                        pseudo: true,
                        image: true,
                    },
                },

                _count: {
                    select: {
                        likes: true,
                    },
                },
                likes: {
                    select: {
                        userId: true,
                        commentId: true,
                        createdAt: true,
                    },
                },
            },
        });
        
    }

    async findLike(user: any, commentId: string) {
		return this.prisma.userCommentLike.findUnique({
			where: {
				userId_commentId: {
					userId : user,
					commentId,
				},
			},
		});
	}

	async createLike(user: any, commentId: string) {
		return this.prisma.userCommentLike.create({
			data: {
				userId: user,
				commentId,
			},
		});
	}

    async deleteLike(user: any, commentId: string) {
		return this.prisma.userCommentLike.delete({
			where: {
				userId_commentId: {
					userId: user,
					commentId,
				},
			},
		});
	}

    async countByCommentId(commentId: string): Promise<number> {
		return this.prisma.userCommentLike.count({
			where: { commentId },
		});
	}
}
