import {
    Controller,
    UseGuards,
    Post, Get, Delete,
    Body, Param,
    UseInterceptors,
    UploadedFile,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import {
    ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags 
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/AuthGuard';
import { ModeratorGuard } from '../auth/ModeratorGuard';
import { CurrentUser } from '../auth/CurrentUser';
import { PostCommentService } from './post-comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ToggleCommentLikeDto } from './dto/toggle-comment-like.dto';

@ApiTags('post-comment')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('posts/comments')   
export class PostCommentController {
    constructor(private readonly postCommentService: PostCommentService) {}

    @Get(":postId")
    @ApiOperation({ summary: 'Retrieve comments for a specific post' })
    @ApiResponse({
        status: 200,
        description: 'List of comments retrieved successfully.'
    })
    @ApiResponse({ status: 404, description: 'Post not found.' })
    async getCommentsByPostId(
        @Param('postId') postId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.postCommentService.getCommentsByPostId(postId, userId);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new comment' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                    description: 'Text content of the comment',
                    example: 'This is a comment on the post.',
                },
                files: {
                    type: 'string',
                    format: 'binary',
                    description: 'Optional media file for the comment',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Comment created successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
        }),
    )
    async createComment(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateCommentDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.postCommentService.createComment(userId, dto, file);
    }

    @Post('like')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'like status for a comment' })
    @ApiResponse({
        status: 200,
        description: 'comment like toggled successfully.',
        schema: {
            type: 'object',
            properties: {
                liked: { type: 'boolean', example: true },
                likesCount: { type: 'number', example: 12 },
            },
        },
    })
    @ApiResponse({ status: 404, description: 'comment not found.' })
    async toggleLike(
        @CurrentUser('id') userId: string,
        @Body() dto: ToggleCommentLikeDto,
    ) {
        return this.postCommentService.toggleLike(userId, dto.commentId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete your own comment' })
    @ApiResponse({ status: 200, description: 'Comment deleted.' })
    @ApiResponse({ status: 403, description: 'You can only delete your own comments.' })
    @ApiResponse({ status: 404, description: 'Comment not found.' })
    async deleteOwnComment(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.postCommentService.deleteComment(id, userId);
    }

    @Delete(':id/moderate')
    @UseGuards(ModeratorGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Moderator/Admin: delete any comment' })
    @ApiResponse({ status: 200, description: 'Comment deleted by moderator.' })
    @ApiResponse({ status: 403, description: 'Moderator or admin access required.' })
    @ApiResponse({ status: 404, description: 'Comment not found.' })
    async deleteCommentAsModerator(@Param('id') id: string) {
        return this.postCommentService.deleteCommentAsModerator(id);
    }
}