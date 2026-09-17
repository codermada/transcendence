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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FriendService } from './friend.service';
import { AuthGuard } from '../auth/AuthGuard';
import { CurrentUser } from '../auth/CurrentUser';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { ListFriendshipsQueryDto } from './dto/list-friendships-query.dto';
import { FriendshipResponseDto } from './dto/friendship-response.dto';

@ApiTags('friend')
@Controller('friend')
@UseGuards(AuthGuard)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  // ─────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Send a friend request' })
  @ApiResponse({ status: 201, type: FriendshipResponseDto })
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateFriendDto,
  ) {
    return this.friendService.create(user.id, dto);
  }

  // ─────────────────────────────────────────────────────────────
  // READ — collections
  // ─────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'List my friendships (paginated, filterable)' })
  findAll(
    @CurrentUser() user: { id: string },
    @Query() query: ListFriendshipsQueryDto,
  ) {
    return this.friendService.findAll(user.id, query);
  }

  @Get('friends')
  @ApiOperation({ summary: 'List my accepted friends' })
  listFriends(
    @CurrentUser() user: { id: string },
    @Query() query: ListFriendshipsQueryDto,
  ) {
    return this.friendService.listFriends(user.id, query);
  }

  @Get('requests/incoming')
  @ApiOperation({ summary: 'List incoming friend requests (pending)' })
  listIncoming(
    @CurrentUser() user: { id: string },
    @Query() query: ListFriendshipsQueryDto,
  ) {
    return this.friendService.listIncomingRequests(user.id, query);
  }

  @Get('requests/outgoing')
  @ApiOperation({ summary: 'List outgoing friend requests (pending)' })
  listOutgoing(
    @CurrentUser() user: { id: string },
    @Query() query: ListFriendshipsQueryDto,
  ) {
    return this.friendService.listOutgoingRequests(user.id, query);
  }

  @Get('blocked')
  @ApiOperation({ summary: 'List blocked relationships' })
  listBlocked(
    @CurrentUser() user: { id: string },
    @Query() query: ListFriendshipsQueryDto,
  ) {
    return this.friendService.listBlocked(user.id, query);
  }

  // ─────────────────────────────────────────────────────────────
  // READ — single
  // ─────────────────────────────────────────────────────────────
  @Get('with/:userId')
  @ApiOperation({ summary: 'Get the friendship between me and another user' })
  @ApiParam({ name: 'userId', description: 'The other user id' })
  findByUserId(
    @CurrentUser() user: { id: string },
    @Param('userId') otherUserId: string,
  ) {
    return this.friendService.findByUserId(user.id, otherUserId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a friendship by id (must be a participant)' })
  @ApiParam({ name: 'id', description: 'Friendship id' })
  findOne(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.friendService.findOne(user.id, id);
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — lifecycle actions
  // ─────────────────────────────────────────────────────────────
  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept a pending friend request (addressee only)' })
  accept(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.friendService.accept(user.id, id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a pending friend request (addressee only)' })
  reject(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.friendService.reject(user.id, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending friend request (requester only)' })
  cancel(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.friendService.cancel(user.id, id);
  }

  @Patch(':id/remove')
  @ApiOperation({ summary: 'Remove an accepted friend (unfriend)' })
  removeFriend(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.friendService.removeFriend(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a friendship (e.g. message)' })
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateFriendDto,
  ) {
    return this.friendService.update(user.id, id, dto);
  }

  // ─────────────────────────────────────────────────────────────
  // BLOCK / UNBLOCK
  // ─────────────────────────────────────────────────────────────
  @Post('block')
  @ApiOperation({ summary: 'Block a user (creates or updates the relationship)' })
  @ApiBody({ type: BlockUserDto })
  block(@CurrentUser() user: { id: string }, @Body() dto: BlockUserDto) {
    return this.friendService.block(user.id, dto);
  }

  @Patch(':id/unblock')
  @ApiOperation({ summary: 'Unblock a user (blocker only)' })
  unblock(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.friendService.unblock(user.id, id);
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — hard delete
  // ─────────────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hard-delete a friendship (cleanup)' })
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.friendService.remove(user.id, id);
  }
}