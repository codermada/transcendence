import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { auth } from '../auth/auth';

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
