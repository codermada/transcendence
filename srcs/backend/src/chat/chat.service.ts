import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildPairKey } from '../friend/utils/pair-key.util';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesQueryDto } from './dto/get-message-query.dto';

@Injectable()
export class ChatService {
	constructor(private readonly prismaService: PrismaService) {}

	// Find or create conversation table between 2 user
	private async getOrCreateConversation(userOneId: string, userTwoId: string) {
		if (userOneId === userTwoId) {
			throw new ForbiddenException('Cannot create a conversation with yourself.');
		}

		const pairKey = buildPairKey(userOneId, userTwoId);
		const friendship = await this.prismaService.friendship.findUnique({ where: { pairKey } });

		if (friendship && friendship.status === 'BLOCKED') {
			throw new ForbiddenException('Cannot initiate conversation: user is blocked');
		}

		return this.prismaService.messageTable.upsert({
			where: { pairKey },
			create: {
				pairKey,
				user1Id: userOneId < userTwoId ? userOneId : userTwoId,
				user2Id: userOneId < userTwoId ? userTwoId : userOneId,
			},
			update: {},
			include: {
				user1: { select: { id: true, name: true, image: true } },
				user2: { select: { id: true, name: true, image: true } },
			},
		});
	}

	// Save message in database
	async saveMessage(senderId: string, { receiverId, content, mediaUrls = [] }: SendMessageDto) {
		const conversation = await this.getOrCreateConversation(senderId, receiverId);

		const [message] = await this.prismaService.$transaction([
			this.prismaService.message.create({
				data: {
					messageTableId: conversation.id,
					senderId,
					receiverId,
					content,
					mediaUrls,
				},
				include: {
					sender: { select: { id: true, name: true, image: true } },
					receiver: { select: { id: true, name: true, image: true } },
				},
			}),
			this.prismaService.messageTable.update({
				where: { id: conversation.id },
				data: {
					updatedAt: new Date(),
				},
			}),
		]);

		return message;
	}

	// Retrieve user conversation with unread message account and participant
	async getUserConversations(userId: string) {
		const conversations = await this.prismaService.messageTable.findMany({
			where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
			orderBy: { updatedAt: 'desc' },
			include: {
				user1: { select: { id: true, name: true, image: true } },
				user2: { select: { id: true, name: true, image: true } },
				messages: {
					take: 1,
					orderBy: { createdAt: 'desc' },
				},
			},
		});

		return Promise.all(
			conversations.map(async (conversation) => {
				const participant = conversation.user1Id === userId ? conversation.user2 : conversation.user1;
				const unreadCount = await this.prismaService.message.count({
					where: {
						messageTableId: conversation.id,
						receiverId: userId,
						isSeen: false,
					},
				});

				return {
					id: conversation.id,
					participant,
					lastMessage: conversation.messages[0] || null,
					unreadCount,
					updatedAt: conversation.updatedAt,
				};
			}),
		);
	}

	// Get messages start at cursor (last message id) with limit
	async getConversationMessages(userId: string, conversationId: string, { cursor, limit }: GetMessagesQueryDto) {
		const conversation = await this.prismaService.messageTable.findUnique({
			where: { id: conversationId },
		});

		if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
			throw new NotFoundException('Conversation not found or access denied');
		}

		const messages = await this.prismaService.message.findMany({
			where: { messageTableId: conversationId },
			take: limit,
			...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
			orderBy: { createdAt: 'desc' },
			include: {
				sender: { select: { id: true, name: true, image: true } },
			},
		});

		return {
			conversationId,
			messages,
			nextCursor: messages.length === limit ? messages[messages.length - 1].id : null,
		};
	}

	async markAsSeen(userId: string, conversationId: string) {
		const now = new Date();
		const result = await this.prismaService.message.updateMany({
			where: {
				messageTableId: conversationId,
				receiverId: userId,
				isSeen: false,
			},
			data: {
				isSeen: true,
				seenAt: now,
			},
		});

		return { conversationId, updatedCount: result.count, seenAt: now };
	}

	async getConversation(userOneId: string, userTwoId: string) {
		return this.prismaService.messageTable.findUniqueOrThrow({
			where: {
				pairKey: buildPairKey(userOneId, userTwoId),
			},
			include: {
				user1: { select: { id: true, name: true, image: true } },
				user2: { select: { id: true, name: true, image: true } },
			},
		});
	}
}
