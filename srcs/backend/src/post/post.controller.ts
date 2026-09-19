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
import { memoryStorage } from 'multer';
import { AuthGuard } from '../auth/AuthGuard';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsFilterDto } from './dto/get-posts.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Post()
	@UseGuards(AuthGuard)
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
	@UseGuards(AuthGuard)
	async getPosts(@Query() filters: GetPostsFilterDto) {
		return this.postService.getAllPosts(filters);
	}

	@Get(':id')
	@UseGuards(AuthGuard)
	async getPostById(@Param('id') id: string) {
		return this.postService.getPostById(id);
	}
}
