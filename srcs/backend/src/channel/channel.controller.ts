import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../auth/AuthGuard';
import { CurrentUser } from '../auth/CurrentUser';
import { ChannelService } from './channel.service';
import { ChannelGateway } from './channel.gateway';
import { CreateChannelDto } from './dto/create-channel.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SendChannelMessageDto } from './dto/send-message-channel.dto';

@ApiTags('channels')
@Controller('channels')
@UseGuards(AuthGuard)
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly channelGateway: ChannelGateway,
  ) {}

  @Get('available-users')
  @ApiOperation({ summary: 'User list available for channel (excluding blocked users)' })
  getAvailableUsers(@CurrentUser() user: { id: string }) {
    return this.channelService.getAvailableUserToAddInChannel(user.id);
  }

  @Get('my')
  @ApiOperation({ summary: 'Channels list of current user' })
  getMyChannels(@CurrentUser() user: { id: string }) {
    return this.channelService.getUserChannels(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new channel with initial members' })
  async createChannel(@CurrentUser() user: { id: string }, @Body() dto: CreateChannelDto) {
    const channel = await this.channelService.createChannel(user.id, dto);
    this.channelGateway.broadcastChannelCreated(channel);
    return channel;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Channel details and members' })
  getChannelDetails(@CurrentUser() user: { id: string }, @Param('id') channelId: string) {
    return this.channelService.getChannel(user.id, channelId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete channel (Admin)' })
  async deleteChannel(@CurrentUser() user: { id: string }, @Param('id') channelId: string) {
    const result = await this.channelService.deleteChannel(user.id, channelId);
    this.channelGateway.broadcastChannelDeleted(channelId);
    return result;
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add new member (Admin)' })
  async addMember(
    @CurrentUser() user: { id: string },
    @Param('id') channelId: string,
    @Body() dto: AddMemberDto,
  ) {
    const newMember = await this.channelService.addMember(user.id, channelId, dto.memberId);
    this.channelGateway.broadcastMemberJoined(channelId, newMember);
    return newMember;
  }

  @Delete(':id/members/:targetUserId')
  @ApiOperation({ summary: 'Kick member (Admin)' })
  async kickMember(
    @CurrentUser() user: { id: string },
    @Param('id') channelId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    const result = await this.channelService.kickMember(user.id, channelId, targetUserId);
    this.channelGateway.broadcastMemberLeft(channelId, targetUserId, 'kicked');
    return result;
  }

  @Patch(':id/members/:targetUserId/role')
  @ApiOperation({ summary: 'Update member role (Admin)' })
  async updateMemberRole(
    @CurrentUser() user: { id: string },
    @Param('id') channelId: string,
    @Param('targetUserId') targetUserId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    const updated = await this.channelService.updateMemberRole(
      user.id,
      channelId,
      targetUserId,
      dto.role,
    );
    this.channelGateway.broadcastRoleUpdated(channelId, targetUserId, dto.role);
    return updated;
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Quit channel' })
  async leaveChannel(@CurrentUser() user: { id: string }, @Param('id') channelId: string) {
    const result = await this.channelService.leaveChannel(user.id, channelId);
    this.channelGateway.broadcastMemberLeft(channelId, user.id, 'left');
    return result;
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Retrieve all messages from the channel' })
  getMessages(@CurrentUser() user: { id: string }, @Param('id') channelId: string) {
    return this.channelService.getChannelMessages(user.id, channelId);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message in the channel with attachments' })
  @UseInterceptors(
    FilesInterceptor('files', 50, {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async sendChannelMessage(
    @CurrentUser() user: { id: string },
    @Param('id') channelId: string,
    @Body() dto: SendChannelMessageDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const { message, memberIds } = await this.channelService.saveChannelMessage(user.id, channelId, dto, files);
    this.channelGateway.broadcastNewMessage(channelId, message, memberIds);
    return message;
  }

  @Post(':id/seen')
  @ApiOperation({ summary: 'Mark all messages in channel as seen for current user' })
  async markAsSeen(
    @CurrentUser() user: { id: string },
    @Param('id') channelId: string,
  ) {
    const result = await this.channelService.markAsSeen(user.id, channelId);
    this.channelGateway.broadcastMessagesSeen(channelId, user.id);
    return result;
  }
}
