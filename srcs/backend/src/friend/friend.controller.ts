import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FriendService } from './friend.service';
import { AuthGuard } from '../auth/AuthGuard';
import { CurrentUserId } from '../auth/CurrentUserId';
import { ApiKeyGuard } from '../auth/ApiKeyGuard';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { ListFriendshipsQueryDto } from './dto/list-friendships-query.dto';
import { FriendshipResponseDto } from './dto/friendship-response.dto';

@ApiTags('friend')
@Controller('friend')
export class FriendController {
	constructor(private readonly friendService: FriendService) {}

	// ═════════════════════════════════════════════════════════════
	// SESSION-AUTH ROUTES
	// ═════════════════════════════════════════════════════════════
	@UseGuards(AuthGuard)
	@Post()
	@ApiOperation({ summary: 'Send a friend request' })
	@ApiResponse({ status: 201, type: FriendshipResponseDto })
	create(@CurrentUserId() userId: string, @Body() dto: CreateFriendDto) {
		return this.friendService.create(userId, dto);
	}

	@UseGuards(AuthGuard)
	@Get()
	@ApiOperation({ summary: 'List my friendships (paginated, filterable)' })
	findAll(@CurrentUserId() userId: string, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.findAll(userId, query);
	}

	@UseGuards(AuthGuard)
	@Get('friends')
	@ApiOperation({ summary: 'List my accepted friends' })
	listFriends(@CurrentUserId() userId: string, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listFriends(userId, query);
	}

	@UseGuards(AuthGuard)
	@Get('requests/incoming')
	@ApiOperation({ summary: 'List incoming friend requests (pending)' })
	listIncoming(@CurrentUserId() userId: string, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listIncomingRequests(userId, query);
	}

	@UseGuards(AuthGuard)
	@Get('requests/outgoing')
	@ApiOperation({ summary: 'List outgoing friend requests (pending)' })
	listOutgoing(@CurrentUserId() userId: string, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listOutgoingRequests(userId, query);
	}

	@UseGuards(AuthGuard)
	@Get('blocked')
	@ApiOperation({ summary: 'List blocked relationships' })
	listBlocked(@CurrentUserId() userId: string, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listBlocked(userId, query);
	}

	@UseGuards(AuthGuard)
	@Get('with/:userId')
	@ApiOperation({ summary: 'Get the friendship between me and another user' })
	@ApiParam({ name: 'userId', description: 'The other user id' })
	findByUserId(@CurrentUserId() userId: string, @Param('userId') otherUserId: string) {
		return this.friendService.findByUserId(userId, otherUserId);
	}

	@UseGuards(AuthGuard)
	@Get(':id')
	@ApiOperation({ summary: 'Get a friendship by id (must be a participant)' })
	@ApiParam({ name: 'id', description: 'Friendship id' })
	findOne(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.findOne(userId, id);
	}

	@UseGuards(AuthGuard)
	@Patch(':id/accept')
	@ApiOperation({ summary: 'Accept a pending friend request (addressee only)' })
	accept(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.accept(userId, id);
	}

	@UseGuards(AuthGuard)
	@Patch(':id/reject')
	@ApiOperation({ summary: 'Reject a pending friend request (addressee only)' })
	reject(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.reject(userId, id);
	}

	@UseGuards(AuthGuard)
	@Patch(':id/cancel')
	@ApiOperation({ summary: 'Cancel a pending friend request (requester only)' })
	cancel(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.cancel(userId, id);
	}

	@UseGuards(AuthGuard)
	@Patch(':id/remove')
	@ApiOperation({ summary: 'Remove an accepted friend (unfriend)' })
	removeFriend(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.removeFriend(userId, id);
	}

	@UseGuards(AuthGuard)
	@Patch(':id')
	@ApiOperation({ summary: 'Update a friendship (e.g. message)' })
	update(@CurrentUserId() userId: string, @Param('id') id: string, @Body() dto: UpdateFriendDto) {
		return this.friendService.update(userId, id, dto);
	}

	@UseGuards(AuthGuard)
	@Post('block')
	@ApiOperation({ summary: 'Block a user (creates or updates the relationship)' })
	@ApiBody({ type: BlockUserDto })
	block(@CurrentUserId() userId: string, @Body() dto: BlockUserDto) {
		return this.friendService.block(userId, dto);
	}

	@UseGuards(AuthGuard)
	@Patch(':id/unblock')
	@ApiOperation({ summary: 'Unblock a user (blocker only)' })
	unblock(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.unblock(userId, id);
	}

	@UseGuards(AuthGuard)
	@Delete(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Hard-delete a friendship (cleanup)' })
	remove(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.remove(userId, id);
	}

	// ═════════════════════════════════════════════════════════════
	// API-KEY ROUTES  —  /friend/api-key/...
	// ═════════════════════════════════════════════════════════════
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Post('api-key')
	@ApiOperation({ summary: '[API key] Send a friend request' })
	@ApiResponse({ status: 201, type: FriendshipResponseDto })
	createViaApiKey(@CurrentUserId() userId: string, @Body() dto: CreateFriendDto) {
		return this.friendService.create(userId, dto);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key')
	@ApiOperation({ summary: '[API key] List my friendships (paginated, filterable)' })
	findAllViaApiKey(@CurrentUserId() userId: string, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.findAll(userId, query);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/friends')
	@ApiOperation({ summary: '[API key] List my accepted friends' })
	listFriendsViaApiKey(@CurrentUserId() userId: string, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listFriends(userId, query);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/requests/incoming')
	@ApiOperation({ summary: '[API key] List incoming friend requests (pending)' })
	listIncomingViaApiKey(@CurrentUserId() userId: string, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listIncomingRequests(userId, query);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/requests/outgoing')
	@ApiOperation({ summary: '[API key] List outgoing friend requests (pending)' })
	listOutgoingViaApiKey(@CurrentUserId() userId: string, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listOutgoingRequests(userId, query);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/blocked')
	@ApiOperation({ summary: '[API key] List blocked relationships' })
	listBlockedViaApiKey(@CurrentUserId() userId: string, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listBlocked(userId, query);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/with/:userId')
	@ApiOperation({ summary: '[API key] Get the friendship between me and another user' })
	@ApiParam({ name: 'userId', description: 'The other user id' })
	findByUserIdViaApiKey(@CurrentUserId() userId: string, @Param('userId') otherUserId: string) {
		return this.friendService.findByUserId(userId, otherUserId);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/:id')
	@ApiOperation({ summary: '[API key] Get a friendship by id (must be a participant)' })
	@ApiParam({ name: 'id', description: 'Friendship id' })
	findOneViaApiKey(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.findOne(userId, id);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id/accept')
	@ApiOperation({ summary: '[API key] Accept a pending friend request (addressee only)' })
	acceptViaApiKey(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.accept(userId, id);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id/reject')
	@ApiOperation({ summary: '[API key] Reject a pending friend request (addressee only)' })
	rejectViaApiKey(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.reject(userId, id);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id/cancel')
	@ApiOperation({ summary: '[API key] Cancel a pending friend request (requester only)' })
	cancelViaApiKey(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.cancel(userId, id);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id/remove')
	@ApiOperation({ summary: '[API key] Remove an accepted friend (unfriend)' })
	removeFriendViaApiKey(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.removeFriend(userId, id);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id')
	@ApiOperation({ summary: '[API key] Update a friendship (e.g. message)' })
	updateViaApiKey(@CurrentUserId() userId: string, @Param('id') id: string, @Body() dto: UpdateFriendDto) {
		return this.friendService.update(userId, id, dto);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Post('api-key/block')
	@ApiOperation({ summary: '[API key] Block a user (creates or updates the relationship)' })
	@ApiBody({ type: BlockUserDto })
	blockViaApiKey(@CurrentUserId() userId: string, @Body() dto: BlockUserDto) {
		return this.friendService.block(userId, dto);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id/unblock')
	@ApiOperation({ summary: '[API key] Unblock a user (blocker only)' })
	unblockViaApiKey(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.unblock(userId, id);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Delete('api-key/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: '[API key] Hard-delete a friendship (cleanup)' })
	removeViaApiKey(@CurrentUserId() userId: string, @Param('id') id: string) {
		return this.friendService.remove(userId, id);
	}
}