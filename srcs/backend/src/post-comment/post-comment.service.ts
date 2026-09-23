import { Injectable, NotFoundException } from '@nestjs/common';
import { PostCommentRepository } from './post-comment.repository';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class PostCommentService {
    constructor(
        private readonly postCommentRepository: PostCommentRepository,
        private readonly s3Service: S3Service,
    ) {}

    private formatComment(comment: any, user: any) {

        const isCommentByCurrentUser = comment.userId === user.id;
        const isLikedByCurrentUser = comment.likes.some((like: any) => like.userId === user.id);

        return {
            id: comment.id,
            userId: comment.userId,
            content: comment.content,
            mediaUrl: comment.mediaUrl,
            
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,

            likesCount: comment._count.likes,

            isLikedByCurrentUser: isLikedByCurrentUser,
            isCommentByCurrentUser: isCommentByCurrentUser,

            user: {
                name: comment.user.name,
                pseudo: comment.user.pseudo,
                image: comment.user.image,
            },
        };

    }

    async getCommentsByPostId(postId: string, user: any) {
        const comments = await this.postCommentRepository.findCommentsByPostId(postId);

        if (!comments || comments.length === 0) {
            return [];
        }
        return comments.map((comment) => this.formatComment(comment, user));
    }

    async createComment(user: any, dto: any, file?: Express.Multer.File) {
        if (file) {
            const uploadedFileUrl = 
            await this.s3Service.uploadFile(file, 'comments');
            dto.mediaUrl = uploadedFileUrl;
        }
        const createdComment = await this.postCommentRepository.create(user, dto);

        return this.formatComment(createdComment, user);
    }

    async toggleLike(user: any, commentId: string) {
        const comment = await this.postCommentRepository.findCommentById(commentId);

        if (!comment) {
            throw new NotFoundException('Comment not found.');
        }

		const existingLike = await this.postCommentRepository.findLike(user, commentId);

		let liked: boolean;

		if (existingLike) {
			await this.postCommentRepository.deleteLike(user, commentId);
			liked = false;
		} else {
			await this.postCommentRepository.createLike(user, commentId);
			liked = true;
		}

		const likesCount = await this.postCommentRepository.countByCommentId(commentId);

		return {
			liked,
			likesCount,
		};
    }
}

