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
	Req,
	UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { FriendService } from './friend.service';
import { AuthGuard } from '../auth/AuthGuard';
import { CurrentUser } from '../auth/CurrentUser';
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
	// SESSION-AUTH ROUTES (unchanged)
	// ═════════════════════════════════════════════════════════════
	@UseGuards(AuthGuard)
	@Post()
	@ApiOperation({ summary: 'Send a friend request' })
	@ApiResponse({ status: 201, type: FriendshipResponseDto })
	create(@CurrentUser() user: { id: string }, @Body() dto: CreateFriendDto) {
		return this.friendService.create(user.id, dto);
	}

	@UseGuards(AuthGuard)
	@Get()
	@ApiOperation({ summary: 'List my friendships (paginated, filterable)' })
	findAll(@CurrentUser() user: { id: string }, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.findAll(user.id, query);
	}

	@UseGuards(AuthGuard)
	@Get('friends')
	@ApiOperation({ summary: 'List my accepted friends' })
	listFriends(@CurrentUser() user: { id: string }, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listFriends(user.id, query);
	}

	@UseGuards(AuthGuard)
	@Get('requests/incoming')
	@ApiOperation({ summary: 'List incoming friend requests (pending)' })
	listIncoming(@CurrentUser() user: { id: string }, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listIncomingRequests(user.id, query);
	}

	@UseGuards(AuthGuard)
	@Get('requests/outgoing')
	@ApiOperation({ summary: 'List outgoing friend requests (pending)' })
	listOutgoing(@CurrentUser() user: { id: string }, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listOutgoingRequests(user.id, query);
	}

	@UseGuards(AuthGuard)
	@Get('blocked')
	@ApiOperation({ summary: 'List blocked relationships' })
	listBlocked(@CurrentUser() user: { id: string }, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listBlocked(user.id, query);
	}

	@UseGuards(AuthGuard)
	@Get('with/:userId')
	@ApiOperation({ summary: 'Get the friendship between me and another user' })
	@ApiParam({ name: 'userId', description: 'The other user id' })
	findByUserId(@CurrentUser() user: { id: string }, @Param('userId') otherUserId: string) {
		return this.friendService.findByUserId(user.id, otherUserId);
	}

	@UseGuards(AuthGuard)
	@Get(':id')
	@ApiOperation({ summary: 'Get a friendship by id (must be a participant)' })
	@ApiParam({ name: 'id', description: 'Friendship id' })
	findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
		return this.friendService.findOne(user.id, id);
	}

	@UseGuards(AuthGuard)
	@Patch(':id/accept')
	@ApiOperation({ summary: 'Accept a pending friend request (addressee only)' })
	accept(@CurrentUser() user: { id: string }, @Param('id') id: string) {
		return this.friendService.accept(user.id, id);
	}

	@UseGuards(AuthGuard)
	@Patch(':id/reject')
	@ApiOperation({ summary: 'Reject a pending friend request (addressee only)' })
	reject(@CurrentUser() user: { id: string }, @Param('id') id: string) {
		return this.friendService.reject(user.id, id);
	}

	@UseGuards(AuthGuard)
	@Patch(':id/cancel')
	@ApiOperation({ summary: 'Cancel a pending friend request (requester only)' })
	cancel(@CurrentUser() user: { id: string }, @Param('id') id: string) {
		return this.friendService.cancel(user.id, id);
	}

	@UseGuards(AuthGuard)
	@Patch(':id/remove')
	@ApiOperation({ summary: 'Remove an accepted friend (unfriend)' })
	removeFriend(@CurrentUser() user: { id: string }, @Param('id') id: string) {
		return this.friendService.removeFriend(user.id, id);
	}

	@UseGuards(AuthGuard)
	@Patch(':id')
	@ApiOperation({ summary: 'Update a friendship (e.g. message)' })
	update(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: UpdateFriendDto) {
		return this.friendService.update(user.id, id, dto);
	}

	@UseGuards(AuthGuard)
	@Post('block')
	@ApiOperation({ summary: 'Block a user (creates or updates the relationship)' })
	@ApiBody({ type: BlockUserDto })
	block(@CurrentUser() user: { id: string }, @Body() dto: BlockUserDto) {
		return this.friendService.block(user.id, dto);
	}

	@UseGuards(AuthGuard)
	@Patch(':id/unblock')
	@ApiOperation({ summary: 'Unblock a user (blocker only)' })
	unblock(@CurrentUser() user: { id: string }, @Param('id') id: string) {
		return this.friendService.unblock(user.id, id);
	}

	@UseGuards(AuthGuard)
	@Delete(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Hard-delete a friendship (cleanup)' })
	remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
		return this.friendService.remove(user.id, id);
	}

	// ═════════════════════════════════════════════════════════════
	// API-KEY ROUTES (duplicates)  —  /friend/api-key/...
	// ═════════════════════════════════════════════════════════════
	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Post('api-key')
	@ApiOperation({ summary: '[API key] Send a friend request' })
	@ApiResponse({ status: 201, type: FriendshipResponseDto })
	createViaApiKey(@Req() req: Request, @Body() dto: CreateFriendDto) {
		return this.friendService.create(req.apiKey!.referenceId, dto);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key')
	@ApiOperation({ summary: '[API key] List my friendships (paginated, filterable)' })
	findAllViaApiKey(@Req() req: Request, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.findAll(req.apiKey!.referenceId, query);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/friends')
	@ApiOperation({ summary: '[API key] List my accepted friends' })
	listFriendsViaApiKey(@Req() req: Request, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listFriends(req.apiKey!.referenceId, query);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/requests/incoming')
	@ApiOperation({ summary: '[API key] List incoming friend requests (pending)' })
	listIncomingViaApiKey(@Req() req: Request, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listIncomingRequests(req.apiKey!.referenceId, query);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/requests/outgoing')
	@ApiOperation({ summary: '[API key] List outgoing friend requests (pending)' })
	listOutgoingViaApiKey(@Req() req: Request, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listOutgoingRequests(req.apiKey!.referenceId, query);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/blocked')
	@ApiOperation({ summary: '[API key] List blocked relationships' })
	listBlockedViaApiKey(@Req() req: Request, @Query() query: ListFriendshipsQueryDto) {
		return this.friendService.listBlocked(req.apiKey!.referenceId, query);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/with/:userId')
	@ApiOperation({ summary: '[API key] Get the friendship between me and another user' })
	@ApiParam({ name: 'userId', description: 'The other user id' })
	findByUserIdViaApiKey(@Req() req: Request, @Param('userId') otherUserId: string) {
		return this.friendService.findByUserId(req.apiKey!.referenceId, otherUserId);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Get('api-key/:id')
	@ApiOperation({ summary: '[API key] Get a friendship by id (must be a participant)' })
	@ApiParam({ name: 'id', description: 'Friendship id' })
	findOneViaApiKey(@Req() req: Request, @Param('id') id: string) {
		return this.friendService.findOne(req.apiKey!.referenceId, id);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id/accept')
	@ApiOperation({ summary: '[API key] Accept a pending friend request (addressee only)' })
	acceptViaApiKey(@Req() req: Request, @Param('id') id: string) {
		return this.friendService.accept(req.apiKey!.referenceId, id);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id/reject')
	@ApiOperation({ summary: '[API key] Reject a pending friend request (addressee only)' })
	rejectViaApiKey(@Req() req: Request, @Param('id') id: string) {
		return this.friendService.reject(req.apiKey!.referenceId, id);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id/cancel')
	@ApiOperation({ summary: '[API key] Cancel a pending friend request (requester only)' })
	cancelViaApiKey(@Req() req: Request, @Param('id') id: string) {
		return this.friendService.cancel(req.apiKey!.referenceId, id);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id/remove')
	@ApiOperation({ summary: '[API key] Remove an accepted friend (unfriend)' })
	removeFriendViaApiKey(@Req() req: Request, @Param('id') id: string) {
		return this.friendService.removeFriend(req.apiKey!.referenceId, id);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id')
	@ApiOperation({ summary: '[API key] Update a friendship (e.g. message)' })
	updateViaApiKey(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateFriendDto) {
		return this.friendService.update(req.apiKey!.referenceId, id, dto);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Post('api-key/block')
	@ApiOperation({ summary: '[API key] Block a user (creates or updates the relationship)' })
	@ApiBody({ type: BlockUserDto })
	blockViaApiKey(@Req() req: Request, @Body() dto: BlockUserDto) {
		return this.friendService.block(req.apiKey!.referenceId, dto);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Patch('api-key/:id/unblock')
	@ApiOperation({ summary: '[API key] Unblock a user (blocker only)' })
	unblockViaApiKey(@Req() req: Request, @Param('id') id: string) {
		return this.friendService.unblock(req.apiKey!.referenceId, id);
	}

	@UseGuards(ApiKeyGuard)
	@ApiSecurity('x-api-key')
	@Delete('api-key/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: '[API key] Hard-delete a friendship (cleanup)' })
	removeViaApiKey(@Req() req: Request, @Param('id') id: string) {
		return this.friendService.remove(req.apiKey!.referenceId, id);
	}
}
