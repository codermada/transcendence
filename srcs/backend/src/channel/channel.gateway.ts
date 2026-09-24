import { Logger, UsePipes, ValidationPipe } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

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
		
	}

}