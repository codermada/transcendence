import { Injectable } from "@nestjs/common";

@Injectable()
export class PresenceService {
	private readonly onlineUsers = new Map<string, Set<string>>();

	addConnection(userId: string, socketId: string): boolean {
		if (!this.onlineUsers.has(userId)) {
			this.onlineUsers.set(userId, new Set());
		}
		const sockets = this.onlineUsers.get(userId)!;
		const isFirstConnection = sockets.size === 0;
		sockets.add(socketId);

		return isFirstConnection;
	}

	removeConnection(userId: string, socketId: string): boolean {
		const sockets = this.onlineUsers.get(userId);
		if (!sockets) {
			return false;
		}
		sockets.delete(socketId);
		if (sockets.size === 0) {
			this.onlineUsers.delete(userId);
			return true;
		}
		return false;
	}

	isUserOnline(userId: string): boolean {
		return this.onlineUsers.has(userId) && this.onlineUsers.get(userId)!.size > 0;
	}

	getOnlineUsersIds(): string[] {
		return Array.from(this.onlineUsers.keys());
	}
}
