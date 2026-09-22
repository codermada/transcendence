import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/AuthGuard';
import { CurrentUser } from '../../auth/CurrentUser';
import { NetworkService } from './network.service';

@ApiTags('feed friends (user network)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('feed-friends')
export class NetworkController {
	constructor(private readonly networkService: NetworkService) {}

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
}
