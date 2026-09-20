import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	Req,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../auth/AuthGuard';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsFilterDto } from './dto/get-posts.dto';
import { PostService } from './post.service';

@ApiTags('posts')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('posts')
export class PostController {
	constructor(private readonly postService: PostService) {}

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
		}),
	)
	async createPost(@Req() req: any, @Body() dto: CreatePostDto, @UploadedFiles() files?: Express.Multer.File[]) {
		const userId = req.user.id;
		return this.postService.createPost(userId, dto, files);
	}

	@Get()
	@ApiOperation({ summary: 'Retrieve feed posts with hybrid pagination and filters' })
	@ApiResponse({ status: 200, description: 'List of posts retrieved successfully.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async getPosts(@Query() filters: GetPostsFilterDto) {
		return this.postService.getAllPosts(filters);
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
}
