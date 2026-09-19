import { Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsFilterDto } from './dto/get-posts.dto';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
	constructor(
		private readonly postRepository: PostRepository,
		private readonly s3Service: S3Service,
	) {}

	async getAllPosts(filters: GetPostsFilterDto) {
		const posts = await this.postRepository.findAll(filters);

		return posts.map((post) => this.formatPost(post));
	}

	async getPostById(id: string) {
		const post = await this.postRepository.findById(id);

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

		const createdPost = await this.postRepository.create(userId, {
			...dto,
			mediaUrls: [...(dto.mediaUrls || []), ...uploadedMediaUrls],
		});

		return this.formatPost(createdPost);
	}

	private formatPost(post: any) {
		return {
			id: post.id,
			author: post.user.name,
			initials: post.user.name.substring(0, 2).toUpperCase(),
			authorImage: post.user.image,
			content: post.content,
			mediaUrls: post.mediaUrls,
			createdAt: post.createdAt,
			likesCount: post._count?.likes ?? 0,
			commentsCount: post._count?.comments ?? 0,
		};
	}
}
