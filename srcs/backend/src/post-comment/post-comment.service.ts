import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../post/post.repository';
import { S3Service } from '../s3/s3.service';
import { PostCommentRepository } from './post-comment.repository';

@Injectable()
export class PostCommentService {
	constructor(
		private readonly postCommentRepository: PostCommentRepository,
		private readonly postRepository: PostRepository,
		private readonly s3Service: S3Service,
	) {}

	private formatComment(comment: any, userId: string) {
		const isCommentByCurrentUser = comment.userId === userId;
		const isLikedByCurrentUser = comment.likes.some((like: any) => like.userId === userId);

		return {
			id: comment.id,
			userId: comment.userId,
			content: comment.content,
			mediaUrl: comment.mediaUrl,

			createdAt: comment.createdAt,
			updatedAt: comment.updatedAt,

			likesCount: comment._count.likes,

			isLikedByCurrentUser,
			isCommentByCurrentUser,

			user: {
				name: comment.user.name,
				pseudo: comment.user.pseudo,
				image: comment.user.image,
			},
		};
	}

	async getCommentsByPostId(postId: string, userId: string) {
		const comments = await this.postCommentRepository.findCommentsByPostId(postId);

		if (!comments || comments.length === 0) {
			return [];
		}
		return comments.map((comment) => this.formatComment(comment, userId));
	}

	async createComment(userId: string, dto: any, file?: Express.Multer.File) {
		const post = await this.postRepository.findById(dto.postId);
		if (!post) {
			throw new NotFoundException("Post doesn't exist anymore");
		}
		const createdComment = await this.postCommentRepository.create(userId, dto);
		if (file) {
			const uploadedFileUrl = await this.s3Service.uploadFile(file, 'comments');
			dto.mediaUrl = uploadedFileUrl;
		}

		return this.formatComment(createdComment, userId);
	}

	async toggleLike(userId: string, commentId: string) {
		const comment = await this.postCommentRepository.findCommentById(commentId);

		if (!comment) {
			throw new NotFoundException('Comment not found.');
		}

		const existingLike = await this.postCommentRepository.findLike(userId, commentId);

		let liked: boolean;

		if (existingLike) {
			await this.postCommentRepository.deleteLike(userId, commentId);
			liked = false;
		} else {
			await this.postCommentRepository.createLike(userId, commentId);
			liked = true;
		}

		const likesCount = await this.postCommentRepository.countByCommentId(commentId);

		return {
			liked,
			likesCount,
		};
	}

	// Author deletes their own comment
	async deleteComment(commentId: string, userId: string) {
		const comment = await this.postCommentRepository.findCommentById(commentId);

		if (!comment) {
			throw new NotFoundException('Comment not found.');
		}

		if (comment.userId !== userId) {
			throw new ForbiddenException('You can only delete your own comments.');
		}

		if (comment.mediaUrl) {
			try {
				await this.s3Service.deleteFile(comment.mediaUrl);
			} catch (err) {
				console.warn('S3 delete failed (non-blocking):', err);
			}
		}

		await this.postCommentRepository.delete(commentId);

		return { success: true };
	}

	// Moderator or admin deletes any comment
	async deleteCommentAsModerator(commentId: string) {
		const comment = await this.postCommentRepository.findCommentById(commentId);

		if (!comment) {
			throw new NotFoundException('Comment not found.');
		}

		if (comment.mediaUrl) {
			try {
				await this.s3Service.deleteFile(comment.mediaUrl);
			} catch (err) {
				console.warn('S3 delete failed (non-blocking):', err);
			}
		}

		await this.postCommentRepository.delete(commentId);

		return { success: true };
	}
}
