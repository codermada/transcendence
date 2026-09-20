import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { auth } from '../auth/auth';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatService } from './chat.service';
import { MarkSeenDto } from './dto/mark-seen.dto';

@WebSocketGateway({
	namespace: '/chat',
	cors: {
		origin: '*',
		credentials: true,
	},
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatGateway implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
	private logger: Logger = new Logger(ChatGateway.name);

	@WebSocketServer()
	server: Server;

	constructor(private readonly chatService: ChatService) { }

	async handleConnection(client: Socket) {
		try {
			const session = await auth.api.getSession({
				headers: client.handshake.headers as HeadersInit,
			});

			if (!session || !session.user) {
				this.logger.error(`Unauthenticated client ${client.id} tried to connect`);
				client.disconnect(true);
				return;
			}

			const userId = session.user.id;
			client.data.user = session.user;

			client.join(`user:${userId}`);
		} catch (error) {
			this.logger.error(`failed to get session for client: ${client.id}`, error);
			client.disconnect(true);
		}
	}

	async handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage('join_conversation')
	handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() payload: { conversationId: string }) {
		if (!payload.conversationId) {
			this.logger.error(`Invalid conversation ID for client: ${client.id}`);
			return;
		}
		client.join(`conversation:${payload.conversationId}`);
		return { status: 'joined', conversationId: payload.conversationId };
	}

	@SubscribeMessage('quit_conversation')
	handleQuitConversation(@ConnectedSocket() client: Socket, @MessageBody() payload: { conversationId: string }) {
		if (!payload.conversationId) {
			this.logger.error(`Invalid conversation ID for client: ${client.id}`);
			return;
		}
		client.leave(`conversation:${payload.conversationId}`);
		return { status: 'left', conversationId: payload.conversationId };
	}

	@SubscribeMessage('send_message')
	async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() sendMessageDto: SendMessageDto) {
		const sender = client.data.user;
		if (!sender) {
			return { success: false, message: 'Unauthorized' };
		}

		try {
			const message = await this.chatService.saveMessage(sender.id, sendMessageDto);
			this.broadcastNewMessage(message);
			return { success: true, message };
		} catch (error: any) {
			this.logger.error(`Failed to send message for client: ${client.id}`, error);
			return { success: false, message: error.message || 'Failed to send message' };
		}
	}

	@SubscribeMessage('seen')
	async handleSeen(@ConnectedSocket() client: Socket, @MessageBody() markSeenDto: MarkSeenDto) {
		const user = client.data.user;
		if (!user) {
			return { success: false, message: 'Unauthorized' };
		}

		const { updatedCount, seenAt } = await this.chatService.markAsSeen(user.id, markSeenDto.conversationId);

		return { success: true, updatedCount, seenAt };
	}

	broadcastNewMessage(message: any) {
		if (this.server) {
			this.server.to(`user:${message.receiverId}`).emit('new_message', message);
			this.server.to(`conversation:${message.messageTableId}`).emit('new_message', message);
		}
	}

	broadcastSeen(conversationId: string, seenByUserId: string, seenAt: Date) {
		if (this.server) {
			this.server.to(`conversation:${conversationId}`).emit('message_seen', { conversationId, seenByUserId, seenAt })
		}
	}
}
