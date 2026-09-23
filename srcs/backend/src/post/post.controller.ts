import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../auth/AuthGuard';
import { CurrentUser } from '../auth/CurrentUser';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsFilterDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@ApiTags('posts')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('posts')
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Get()
	@ApiOperation({ summary: 'Retrieve feed posts with hybrid pagination and filters' })
	@ApiResponse({ status: 200, description: 'List of posts retrieved successfully.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async getPosts(@Query() filters: GetPostsFilterDto, @CurrentUser('id') currentUserId: string) {
		return this.postService.getAllPosts(filters, currentUserId);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get details of a specific post by ID' })
	@ApiParam({ name: 'id', description: 'Unique identifier of the post', type: String })
	@ApiResponse({ status: 200, description: 'Post details retrieved successfully.' })
	@ApiResponse({ status: 404, description: 'Post not found.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async getPostById(@Param('id') id: string) {
		return this.postService.getPostById(id);
	}

	@Post()
	@ApiOperation({ summary: 'Create a new post with optional media attachments' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				content: {
					type: 'string',
					description: 'Text content of the post',
					example: 'Check out these recent updates!',
				},
				files: {
					type: 'array',
					items: {
						type: 'string',
						format: 'binary',
					},
					description: 'Media files (images/videos, max 10)',
				},
			},
		},
	})
	@ApiResponse({ status: 201, description: 'Post created successfully.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@UseInterceptors(
		FilesInterceptor('files', 10, {
			storage: memoryStorage(),
			limits: {
				fileSize: 300 * 1024 * 1024,
			},
		}),
	)
	async createPost(
		@CurrentUser('id') userId: string,
		@Body() dto: CreatePostDto,
		@UploadedFiles() files?: Express.Multer.File[],
	) {
		return this.postService.createPost(userId, dto, files);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update an existing post and its media attachments' })
	@ApiConsumes('multipart/form-data')
	@ApiParam({ name: 'id', description: 'Post ID', type: String })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				content: { type: 'string', description: 'Updated text content' },
				mediaUrls: {
					type: 'array',
					items: { type: 'string' },
					description: 'Kept media URLs from previous upload',
				},
				files: {
					type: 'array',
					items: { type: 'string', format: 'binary' },
					description: 'New media files to attach',
				},
			},
		},
	})
	@ApiResponse({ status: 200, description: 'Post updated successfully.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	@ApiResponse({ status: 404, description: 'Post not found.' })
	@UseInterceptors(
		FilesInterceptor('files', 10, {
			storage: memoryStorage(),
		}),
	)
	async updatePost(
		@Param('id') id: string,
		@CurrentUser('id') userId: string,
		@Body() dto: UpdatePostDto,
		@UploadedFiles() files?: Express.Multer.File[],
	) {
		return this.postService.updatePost(id, userId, dto, files);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a post and its associated media files' })
	@ApiParam({ name: 'id', description: 'Post ID', type: String })
	@ApiResponse({ status: 200, description: 'Post deleted successfully.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	@ApiResponse({ status: 404, description: 'Post not found.' })
	async deletePost(@Param('id') id: string, @CurrentUser('id') userId: string) {
		return this.postService.deletePost(id, userId);
	}
}
