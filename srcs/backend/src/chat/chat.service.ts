import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildPairKey } from '../friend/utils/pair-key.util';
import { SendMessageDto } from './dto/send-message.dto';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ChatService {
	constructor(private readonly prismaService: PrismaService, private readonly s3Service: S3Service) {}

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

	private async presaveMessage(dto: SendMessageDto, files?: Express.Multer.File[]) {
		const content = (dto.content || '').trim();
		const hasFiles = files && files.length > 0;

		if (!content && !hasFiles) {
			throw new BadRequestException('Message is empty or no file provided');
		}

		let mediaUrls: string[] = [];
		if (hasFiles) {
			mediaUrls = await Promise.all(files.map((file) => this.s3Service.uploadFile(file, 'chat')));
		}

		return { content, mediaUrls };
	}

	// Save message in database
	async saveMessage(senderId: string, dto: SendMessageDto, files?: Express.Multer.File[]) {
		const conversation = await this.getOrCreateConversation(senderId, dto.receiverId);
		const { content, mediaUrls } = await this.presaveMessage(dto, files);

		const [message] = await this.prismaService.$transaction([
			this.prismaService.message.create({
				data: {
					messageTableId: conversation.id,
					senderId,
					receiverId: dto.receiverId,
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

	// Get all messages for a conversation
	async getConversationMessages(userId: string, conversationId: string) {
		const conversation = await this.prismaService.messageTable.findUnique({
			where: { id: conversationId },
		});

		if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
			throw new NotFoundException('Conversation not found or access denied');
		}

		const messages = await this.prismaService.message.findMany({
			where: { messageTableId: conversationId },
			orderBy: { createdAt: 'desc' },
			include: {
				sender: { select: { id: true, name: true, image: true } },
			},
		});

		return {
			conversationId,
			messages,
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

	async getConversationById(conversationId: string, userId?: string) {
		const conversation = await this.prismaService.messageTable.findUnique({
			where: { id: conversationId },
			include: {
				user1: { select: { id: true, name: true, image: true } },
				user2: { select: { id: true, name: true, image: true } },
			},
		});

		if (!conversation) {
			throw new NotFoundException('Conversation not found');
		}

		if (userId && conversation.user1Id !== userId && conversation.user2Id !== userId) {
			throw new ForbiddenException('Access denied to this conversation');
		}

		const participant = userId ? (conversation.user1Id === userId ? conversation.user2 : conversation.user1) : null;

		return {
			...conversation,
			participant,
		};
	}
}
