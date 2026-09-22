import { Injectable, NotFoundException } from '@nestjs/common';
import { PostLikeRepository } from './post-like.repository';

@Injectable()
export class PostLikeService {
	constructor(private readonly postLikeRepository: PostLikeRepository) {}

	async toggleLike(userId: string, postId: string) {
		const post = await this.postLikeRepository.findPostById(postId);

		if (!post) {
			throw new NotFoundException(`Publication introuvable avec l'ID: ${postId}`);
		}

		const existingLike = await this.postLikeRepository.findLike(userId, postId);

		let liked: boolean;

		if (existingLike) {
			await this.postLikeRepository.deleteLike(userId, postId);
			liked = false;
		} else {
			await this.postLikeRepository.createLike(userId, postId);
			liked = true;
		}

		const likesCount = await this.postLikeRepository.countByPostId(postId);

		return {
			liked,
			likesCount,
		};
	}
}
