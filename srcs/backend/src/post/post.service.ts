import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsFilterDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
	constructor(
		private readonly postRepository: PostRepository,
		private readonly s3Service: S3Service,
	) {}

	async getAllPosts(filters: GetPostsFilterDto, currentUserId: string) {
		const limit = filters.limit ?? 10;
		const page = filters.page ?? 1;

		const computedOffset = filters.offset ?? (page - 1) * limit;

		const posts = await this.postRepository.findAll(
			{
				...filters,
				limit,
				offset: computedOffset,
			},
			currentUserId,
		);

		return posts.map((post) => this.formatPost(post));
	}

	async getPostById(id: string, currentUserId?: string) {
		const post = await this.postRepository.findById(id, currentUserId);

		if (!post) {
			throw new NotFoundException(`Publication introuvable avec l'ID: ${id}`);
		}

		return this.formatPost(post);
	}

	async createPost(userId: string, dto: CreatePostDto, files?: Express.Multer.File[]) {
		const uploadedMediaUrls: string[] = [];

		if (files && files.length > 0) {
			uploadedMediaUrls.push(...(await Promise.all(files.map((file) => this.s3Service.uploadFile(file, 'posts')))));
		}

		const existingMediaUrls = Array.isArray(dto.mediaUrls)
			? dto.mediaUrls
			: typeof dto.mediaUrls === 'string'
				? [dto.mediaUrls]
				: [];

		const createdPost = await this.postRepository.create(userId, {
			...dto,
			mediaUrls: [...existingMediaUrls, ...uploadedMediaUrls],
		});

		return this.formatPost({
			...createdPost,
			isOwner: true,
			isLiked: false,
		});
	}

	async updatePost(postId: string, userId: string, dto: UpdatePostDto, files?: Express.Multer.File[]) {
		const existingPost = await this.postRepository.findById(postId, userId);

		if (!existingPost) {
			throw new NotFoundException(`Publication introuvable avec l'ID: ${postId}`);
		}

		if (existingPost.userId !== userId) {
			throw new ForbiddenException("Vous n'êtes pas autorisé à modifier cette publication.");
		}

		const keptMediaUrls = Array.isArray(dto.mediaUrls)
			? dto.mediaUrls
			: typeof dto.mediaUrls === 'string'
				? [dto.mediaUrls]
				: [];

		const oldMediaUrls: string[] = existingPost.mediaUrls || [];
		const removedMediaUrls = oldMediaUrls.filter((url) => !keptMediaUrls.includes(url));

		if (removedMediaUrls.length > 0) {
			await this.s3Service.deleteFiles(removedMediaUrls);
		}

		const uploadedMediaUrls: string[] = [];
		if (files && files.length > 0) {
			uploadedMediaUrls.push(...(await Promise.all(files.map((file) => this.s3Service.uploadFile(file, 'posts')))));
		}

		const updatedPost = await this.postRepository.update(postId, {
			content: dto.content,
			mediaUrls: [...keptMediaUrls, ...uploadedMediaUrls],
		});

		return this.formatPost({
			...updatedPost,
			isOwner: true,
			isLiked: existingPost.isLiked,
		});
	}

	async deletePost(postId: string, userId: string) {
		const existingPost = await this.postRepository.findById(postId, userId);

		if (!existingPost) {
			throw new NotFoundException(`Publication introuvable avec l'ID: ${postId}`);
		}

		if (existingPost.userId !== userId) {
			throw new ForbiddenException("Vous n'êtes pas autorisé à supprimer cette publication.");
		}

		if (existingPost.mediaUrls && existingPost.mediaUrls.length > 0) {
			await this.s3Service.deleteFiles(existingPost.mediaUrls);
		}

		await this.postRepository.delete(postId);

		return { message: 'Publication supprimée avec succès' };
	}

	async adminDeletePost(postId: string, userId: string) {
		const existingPost = await this.postRepository.findById(postId, userId);

		if (!existingPost) {
			throw new NotFoundException(`Publication introuvable avec l'ID: ${postId}`);
		}

		if (existingPost.mediaUrls && existingPost.mediaUrls.length > 0) {
			await this.s3Service.deleteFiles(existingPost.mediaUrls);
		}

		await this.postRepository.delete(postId);

		return { message: 'Publication supprimée avec succès' };
	}

	async getAssociatedUserIdPosts(filters: GetPostsFilterDto, userId: string, currentUserId: string) {
		const posts = await this.postRepository.findAssociatedUserIdPosts(filters, userId, currentUserId);

		return posts.map((post) => this.formatPost(post));
	}

	private formatPost(post: any) {
		const authorName = post.user.name || post.user.pseudo || 'Utilisateur';

		const initials =
			authorName
				.split(' ')
				.filter(Boolean)
				.map((part: string) => part[0])
				.join('')
				.substring(0, 2)
				.toUpperCase() || 'U';

		return {
			id: post.id,
			authorId: post.user.id,
			author: authorName,
			initials,
			authorImage: post.user.image,
			content: post.content,
			mediaUrls: post.mediaUrls || [],
			isOwner: post.isOwner ?? false,
			isLiked: post.isLiked ?? false,
			createdAt: post.createdAt,
			likesCount: post._count?.likes ?? 0,
			commentsCount: post._count?.comments ?? 0,
		};
	}
}
