import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { S3Service } from "../s3/s3.service";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { ChannelRoleEnum } from "./dto/update-role.dto";
import { SendChannelMessageDto } from "./dto/send-message-channel.dto";

@Injectable()
export class ChannelService {
	constructor(private readonly prismaService: PrismaService, private readonly s3Service: S3Service) { }

	// Fetch available users to add in channel
	async getAvailableUserToAddInChannel(currentUserId: string) {
		const blockedFriendships = await this.prismaService.friendship.findMany({
			where: {
				status: 'BLOCKED',
				OR: [{ requesterId: currentUserId }, { addresseeId: currentUserId }]
			}
		});

		const excludedUserIds = new Set<string>([currentUserId]);

		for (const friendship of blockedFriendships) {
			if (friendship.requesterId !== currentUserId) {
				excludedUserIds.add(friendship.requesterId);
			}
			if (friendship.addresseeId !== currentUserId) {
				excludedUserIds.add(friendship.addresseeId);
			}
		}

		return this.prismaService.user.findMany({
			where: {
				id: { notIn: Array.from(excludedUserIds) }
			},
			select: {
				id: true,
				name: true,
				image: true,
				email: true
			}
		});
	}

	// Fetch all channels for a one user
	async getUserChannels(userId: string) {
		const channels = await this.prismaService.channel.findMany({
			where: {
				members: { some: { userId } }
			},
			include: {
				_count: { select: { messages: true, members: true } },
				members: {
					where: { userId },
					select: {
						role: true,
						joinedAt: true
					}
				},
				messages: {
					take: 1,
					orderBy: { createdAt: 'desc' },
					select: {
						id: true,
						content: true,
						mediaUrls: true,
						createdAt: true,
						userId: true,
					},
				},
			},
			orderBy: { updatedat: 'desc' }
		});

		return Promise.all(
			channels.map(async (channel) => {
				const unreadCount = await this.prismaService.userChannelMessage.count({
					where: {
						channelId: channel.id,
						userId: { not: userId },
						NOT: {
							seenBy: {
								has: userId,
							},
						},
					},
				});

				return {
					...channel,
					lastMessage: channel.messages[0] || null,
					unreadCount,
				};
			})
		);
	}

	// Create channel
	async createChannel(userId: string, { title, description, membersIds = [] }: CreateChannelDto) {
		return await this.prismaService.channel.create({
			data: {
				title,
				description,
				createdById: userId,
				members: {
					create: [
						{ userId, role: 'ADMIN' },
						...Array.from(new Set(membersIds))
							.filter((id) => id !== userId)
							.map((id) => ({ userId: id, role: 'MEMBER' as const }))
					]
				}
			},
			include: {
				members: {
					include: {
						user: { select: { id: true, name: true, image: true, email: true } }
					}
				}
			}
		});
	}

	// Fetch channel details
	async getChannel(userId: string, channelId: string) {
		const channel = await this.prismaService.channel.findUnique({
			where: { id: channelId },
			include: {
				members: {
					include: {
						user: { select: { id: true, name: true, image: true } },
					},
					orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
				},
			},
		});

		if (!channel) throw new NotFoundException('Channel Not Found');

		const isMember = channel.members.some((m) => m.userId === userId);
		if (!isMember) {
			throw new ForbiddenException('You are not a member of this channel.');
		}

		return channel;
	}

	// Add new user in channel
	async addMember(userAdminId: string, channelId: string, targetUserId: string) {
		const admin = await this.findUserInChannel(userAdminId, channelId);
		if (!admin || admin.role !== 'ADMIN') {
			throw new ForbiddenException('You are not an admin of this channel.');
		}

		const targetUserInChannel = await this.findUserInChannel(targetUserId, channelId);
		if (targetUserInChannel) {
			throw new BadRequestException('User is already a member of this channel.');
		}

		return await this.prismaService.userInChannel.create({
			data: {
				channelId,
				userId: targetUserId,
			},
			include: {
				user: {
					select: { id: true, name: true, image: true, email: true }
				}
			}
		})
	}

	// Kick member from channel (Channel admin only)
	async kickMember(userAdminId: string, channelId: string, targetUserId: string) {
		const admin = await this.findUserInChannel(userAdminId, channelId);
		if (!admin || admin.role !== 'ADMIN') {
			throw new ForbiddenException('You are not an admin of this channel.');
		}

		const targetUserInChannel = await this.findUserInChannel(targetUserId, channelId);
		if (!targetUserInChannel) {
			throw new BadRequestException('User is not a member of this channel.');
		}

		return await this.prismaService.userInChannel.delete({
			where: {
				userId_channelId: {
					userId: targetUserId,
					channelId
				}
			}
		});
	}

	// Update member role in channel (Channel admin only)
	async updateMemberRole(userAdminId: string, channelId: string, targetUserId: string, newRole: ChannelRoleEnum) {
		const admin = await this.findUserInChannel(userAdminId, channelId);
		if (!admin || admin.role !== 'ADMIN') {
			throw new ForbiddenException('You are not an admin of this channel.');
		}

		const targetUserInChannel = await this.findUserInChannel(targetUserId, channelId);
		if (!targetUserInChannel) {
			throw new BadRequestException('User is not a member of this channel.');
		}

		if (targetUserInChannel.role === 'ADMIN' && newRole === 'MEMBER') {
			await this.checkAdminCountBeforeChangeAdminCount(channelId);
		}

		return await this.prismaService.userInChannel.update({
			where: {
				userId_channelId: {
					userId: targetUserId,
					channelId
				}
			},
			data: {
				role: newRole
			}
		});
	}

	// Quit Channel
	async leaveChannel(userId: string, channelId: string) {
		const member = await this.prismaService.userInChannel.findUnique({
			where: { userId_channelId: { userId, channelId } },
		});
		if (!member) {
			throw new NotFoundException('You are not a member of this channel.');
		}

		if (member.role === 'ADMIN') {
			await this.checkAdminCountBeforeChangeAdminCount(channelId);
		}

		return await this.prismaService.userInChannel.delete({
			where: { userId_channelId: { userId, channelId } },
		});
	}

	// Delete Channel (Channel admin only)
	async deleteChannel(adminUserId: string, channelId: string) {
		const channel = await this.prismaService.channel.findUnique({
			where: { id: channelId },
		});
		if (!channel) {
			throw new NotFoundException('Channel Not Found');
		}

		const admin = await this.findUserInChannel(adminUserId, channelId);
		if (!admin || admin.role !== 'ADMIN') {
			throw new ForbiddenException('You are not an admin of this channel.');
		}

		return await this.prismaService.channel.delete({
			where: { id: channelId },
		});
	}

	// Fetch all messages in channel
	async getChannelMessages(userId: string, channelId: string) {
		const userInChannel = await this.findUserInChannel(userId, channelId);
		if (!userInChannel) {
			throw new ForbiddenException('You are not a member of this channel.');
		}

		return await this.prismaService.userChannelMessage.findMany({
			where: { channelId },
			orderBy: { createdAt: 'asc' },
			include: {
				user: {
					select: { id: true, name: true, image: true, email: true }
				}
			}
		})
	}

	// Save channel message in DB
	async saveChannelMessage(
		userId: string,
		channelId: string,
		dto: SendChannelMessageDto,
		files?: Express.Multer.File[],
	) {
		const member = await this.findUserInChannel(userId, channelId);
		if (!member) {
			throw new ForbiddenException('You are not a member of this channel.');
		}

		const { content, mediaUrls } = await this.presaveChannelMessage(dto, files);

		return this.prismaService.$transaction(async (prisma) => {
			const message = await prisma.userChannelMessage.create({
				data: {
					channelId,
					userId,
					content,
					mediaUrls,
					seenBy: [userId],
				},
				include: {
					user: { select: { id: true, name: true, image: true, email: true } },
				},
			});

			await prisma.channel.update({
				where: { id: channelId },
				data: { updatedat: new Date() },
			});

			const members = await prisma.userInChannel.findMany({
				where: { channelId },
				select: { userId: true },
			});

			return {
				message,
				memberIds: members.map((m) => m.userId),
			};
		});
	}

	// Mark all channel messages as seen for a user
	async markAsSeen(userId: string, channelId: string) {
		const member = await this.findUserInChannel(userId, channelId);
		if (!member) {
			throw new ForbiddenException('You are not a member of this channel.');
		}

		await this.prismaService.$executeRaw`
			UPDATE "user_channel_messages"
			SET "seenBy" = array_append(COALESCE("seenBy", ARRAY[]::text[]), ${userId}::text)
			WHERE "channelId" = ${channelId}
			  AND NOT (${userId}::text = ANY(COALESCE("seenBy", ARRAY[]::text[])))
		`;

		return { channelId, userId, success: true };
	}

	private async findUserInChannel(userId: string, channelId: string) {
		return await this.prismaService.userInChannel.findUnique({
			where: {
				userId_channelId: {
					userId,
					channelId
				}
			}
		});
	}

	private async checkAdminCountBeforeChangeAdminCount(channelId: string) {
		const adminCount = await this.prismaService.userInChannel.count({
			where: { channelId, role: 'ADMIN' }
		});

		if (adminCount <= 1) {
			throw new BadRequestException('A channel must have at least one admin.');
		}
	}

	private async presaveChannelMessage(dto: SendChannelMessageDto, files?: Express.Multer.File[]) {
		const content = (dto.content || '').trim();
		const hasFiles = files && files.length > 0;

		if (!content && !hasFiles) {
			throw new BadRequestException('Message is empty or no file provided');
		}

		let mediaUrls: string[] = [];
		if (hasFiles) {
			mediaUrls = await Promise.all(files.map((file) => this.s3Service.uploadFile(file, 'channel')));
		}

		return { content, mediaUrls };
	}
}
