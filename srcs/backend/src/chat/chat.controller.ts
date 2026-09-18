import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth/AuthGuard';
import { CurrentUser } from '../auth/CurrentUser';
import { ChatService } from './chat.service';
import { GetMessagesQueryDto } from './dto/get-message-query.dto';

@ApiTags('chat')
@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for the authenticated user' })
  getUserConversations(@CurrentUser() user: { id: string }) {
    return this.chatService.getUserConversations(user.id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get cursor-paginated messages for a conversation' })
  getConversationMessages(
    @CurrentUser() user: { id: string },
    @Param('id') conversationId: string,
    @Query() query: GetMessagesQueryDto,
  ) {
    return this.chatService.getConversationMessages(user.id, conversationId, query);
  }

  @Post('conversations/:id/seen')
  @ApiOperation({ summary: 'Mark all messages in a conversation as seen' })
  markConversationSeen(
    @CurrentUser() user: { id: string },
    @Param('id') conversationId: string,
  ) {
    return this.chatService.markAsSeen(user.id, conversationId);
  }
}