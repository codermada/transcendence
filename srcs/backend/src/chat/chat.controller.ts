import { Body, Controller, Get, Post, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth/AuthGuard';
import { CurrentUser } from '../auth/CurrentUser';
import { ChatService } from './chat.service';
import { GetMessagesQueryDto } from './dto/get-message-query.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatGateway } from './chat.gateway';

@ApiTags('chat')
@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService, private readonly chatGateway: ChatGateway) {}

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
    return this.chatService.markAsSeen(user.id, conversationId)
    .then((result) => {
      if (result.updatedCount > 0) {
        this.chatGateway.broadcastSeen(conversationId, user.id, result.seenAt);
      }
      return result;
    });
  }

  @Get('conversation/:receiverId')
  @ApiOperation({ summary: 'Get conversation by receiver id' })
  getConversationByReceiverId(
    @CurrentUser() user: { id: string },
    @Param('receiverId') receiverId: string,
  ) {
    return this.chatService.getConversation(user.id, receiverId).catch(() => {
      throw new NotFoundException("Conversation not found");
    });
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message to create or continue a conversation' })
  sendMessage(
    @CurrentUser() user: { id: string },
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.saveMessage(user.id, dto)
    .then((message) => {
      this.chatGateway.broadcastNewMessage(message);
      return message;
    });
  }
}
