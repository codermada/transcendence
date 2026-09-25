import { Logger, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { auth } from "../auth/auth";

@WebSocketGateway({
	namespace: '/channels',
	cors: {
		origin: '*',
		credentials: true,
	},
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChannelGateway implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
	private logger: Logger = new Logger(ChannelGateway.name);

	@WebSocketServer()
	server: Server;

	async handleConnection(client: Socket) {
		try {
			const session = await auth.api.getSession({
				headers: client.handshake.headers as HeadersInit
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
			this.logger.error(`Failed to get session for client: ${client.id}`, error);
			client.disconnect(true);
		}
	}

	async handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage('join_channel')
	handleJoinChannel(@ConnectedSocket() client: Socket, @MessageBody() payload: { channelId: string }) {
		if (!payload?.channelId) {
			this.logger.error(`Invalid channel ID for client: ${client.id}`);
			return;
		}
		client.join(`channel:${payload.channelId}`);
		return { status: 'joined', channelId: payload.channelId };
	}

	@SubscribeMessage('leave_channel')
	handleLeaveChannel(@ConnectedSocket() client: Socket, @MessageBody() payload: { channelId: string }) {
		if (!payload?.channelId) {
			this.logger.error(`Invalid channel ID for client: ${client.id}`);
			return;
		}
		client.leave(`channel:${payload.channelId}`);
		return { status: 'left', channelId: payload.channelId };
	}

	broadcastChannelCreated(channel: any) {
		if (this.server && channel?.members) {
			for (const member of channel.members) {
				this.server.to(`user:${member.userId}`).emit('channel_created', channel);
			}
		}
	}

	broadcastNewMessage(channelId: string, message: any) {
		if (this.server) {
			this.server.to(`channel:${channelId}`).emit('new_channel_message', message);
		}
	}

	broadcastMemberJoined(channelId: string, member: any) {
		if (this.server) {
			this.server.to(`channel:${channelId}`).emit('channel_member_joined', { channelId, member });
			this.server.to(`user:${member.userId}`).emit('channel_added_you', { channelId });
		}
	}

	broadcastMemberLeft(channelId: string, userId: string, reason: 'left' | 'kicked') {
		if (this.server) {
			this.server.to(`channel:${channelId}`).emit('channel_member_left', { channelId, userId, reason });
			this.server.to(`user:${userId}`).emit('channel_removed_you', { channelId, reason });
		}
	}

	broadcastRoleUpdated(channelId: string, userId: string, role: string) {
		if (this.server) {
			this.server.to(`channel:${channelId}`).emit('channel_role_updated', { channelId, userId, role });
		}
	}

	broadcastChannelDeleted(channelId: string) {
		if (this.server) {
			this.server.to(`channel:${channelId}`).emit('channel_deleted', { channelId });
		}
	}
}