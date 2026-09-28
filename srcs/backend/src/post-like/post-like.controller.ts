import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/AuthGuard';
import { CurrentUser } from '../auth/CurrentUser';
import { TogglePostLikeDto } from './dto/toggle-post-like.dto';
import { PostLikeService } from './post-like.service';

@ApiTags('post-likes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('posts/likes')
export class PostLikeController {
	constructor(private readonly postLikeService: PostLikeService) {}

	@Post('toggle')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Toggle like status for a post' })
	@ApiResponse({
		status: 200,
		description: 'Post like toggled successfully.',
		schema: {
			type: 'object',
			properties: {
				liked: { type: 'boolean', example: true },
				likesCount: { type: 'number', example: 12 },
			},
		},
	})
	@ApiResponse({ status: 404, description: 'Post not found.' })
	async toggleLike(@CurrentUser('id') userId: string, @Body() dto: TogglePostLikeDto) {
		return this.postLikeService.toggleLike(userId, dto.postId);
	}
}
