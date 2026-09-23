import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
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

	async handleDisconnect(client: Socket) {}
}
