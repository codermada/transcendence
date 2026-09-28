import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/AuthGuard';
import { CurrentUser } from '../../auth/CurrentUser';
import { CreateFriendDto } from '../../friend/dto/create-friend.dto';
import { FriendService } from '../../friend/friend.service';
import { NetworkService } from './network.service';

@ApiTags('feed friends (user network)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('feed-friends')
export class NetworkController {
	constructor(
		private readonly networkService: NetworkService,
		private readonly friendService: FriendService,
	) {}

	@Get()
	@ApiOperation({ summary: 'Retrieve current user friends (received and sent friend requests, friend suggestions)' })
	@ApiResponse({ status: 200, description: "Informations of current user's network retrieved successfully." })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async getUserNetwork(@CurrentUser('id') currentUserId: string) {
		return this.networkService.getUserNetwork(currentUserId);
	}

	@Get('received')
	@ApiOperation({ summary: 'Retrieve current user friends (received and sent friend requests, friend suggestions)' })
	@ApiResponse({ status: 200, description: "Informations of current user's network retrieved successfully." })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async getAllReceivedFriendRequests(@CurrentUser('id') currentUserId: string) {
		return await this.networkService.getAllReceivedFriendRequests(currentUserId);
	}

	@Get('sent')
	@ApiOperation({ summary: 'Retrieve current user friends (received and sent friend requests, friend suggestions)' })
	@ApiResponse({ status: 200, description: "Informations of current user's network retrieved successfully." })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async getAllSentFriendRequests(@CurrentUser('id') currentUserId: string) {
		return await this.networkService.getAllSentFriendRequests(currentUserId);
	}

	@Patch('accept/:id')
	@ApiOperation({ summary: 'Accept user friend request' })
	@ApiResponse({ status: 200, description: 'Friend request accepted successfully.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async acceptFriendRequest(@Param('id') friendRequestId: string, @CurrentUser('id') currentUserId: string) {
		return await this.friendService.accept(currentUserId, friendRequestId);
	}

	@Patch('decline/:id')
	@ApiOperation({ summary: 'Decline user friend request' })
	@ApiResponse({ status: 200, description: 'Friend request declined successfully.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async declineFriendRequest(@Param('id') friendRequestId: string, @CurrentUser('id') currentUserId: string) {
		return await this.friendService.reject(currentUserId, friendRequestId);
	}

	@Delete('delete/:id')
	@ApiOperation({ summary: 'Remove friend' })
	@ApiResponse({ status: 200, description: 'Friend removed successfully.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async removeFriend(@Param('id') friendRequestId: string, @CurrentUser('id') currentUserId: string) {
		return await this.friendService.reject(currentUserId, friendRequestId);
	}

	@Delete('cancel/:id')
	@ApiOperation({ summary: 'Cancel current user friend request' })
	@ApiResponse({ status: 200, description: 'Friend request cancelled successfully.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async cancelFriendRequest(@Param('id') friendRequestId: string, @CurrentUser('id') currentUserId: string) {
		return await this.friendService.cancel(currentUserId, friendRequestId);
	}

	@Get('suggestions')
	@ApiOperation({ summary: 'Retrieve current user friends suggestions' })
	@ApiResponse({
		status: 200,
		description: "Informations of user's friend suggestions network retrieved successfully.",
	})
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async getFriendSuggestions(@CurrentUser('id') currentUserId: string) {
		return await this.networkService.getFriendSuggestions(currentUserId);
	}

	@Post('send')
	@ApiOperation({ summary: 'Send friend request' })
	@ApiResponse({ status: 200, description: 'Friend request sent successfully.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	async sendFriendRequest(@CurrentUser('id') currentUserId: string, @Body() dto: CreateFriendDto) {
		return await this.friendService.create(currentUserId, dto);
	}
}
