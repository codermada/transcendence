import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from './presence.service';
import { auth } from '../auth/auth';

@WebSocketGateway({
	namespace: '/presence',
	cors: { origin: '*', credentials: true },
})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private readonly presenceService: PresenceService) {}

	async handleConnection(client: Socket) {
		const session = await auth.api.getSession({ headers: client.handshake.headers as HeadersInit });
		if (!session?.user) {
			return client.disconnect(true);
		}

		const userId = session.user.id;
		client.data.user = session.user;
		client.join(`user:${userId}`);

		const toOnline = this.presenceService.addConnection(userId, client.id);

		client.emit('presence_initial_state', {
			onlineUserIds: this.presenceService.getOnlineUsersIds(),
		});

		if (toOnline) {
			this.server.emit('presence_changed', { userId, status: 'ONLINE' });
		}
	}

	handleDisconnect(client: Socket) {
		const user = client.data?.user;
		if (!user) return;

		const becameOffline = this.presenceService.removeConnection(user.id, client.id);
		if (becameOffline) {
			this.server.emit('presence_changed', { userId: user.id, status: 'OFFLINE' });
		}
	}

	@SubscribeMessage('get_online_users')
	handleGetOnlineUsers() {
		return { onlineUserIds: this.presenceService.getOnlineUsersIds() };
	}
}
