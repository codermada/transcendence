import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ALLOWED_ROLES, type AllowedRole } from './dto/update-user-role.dto';

const AVATAR_DIR = join(process.cwd(), 'uploads', 'avatars');
const DEFAULT_AVATAR = '/nest/uploads/default-avatar.png';

// Avatar image size in pixels
const AVATAR_SIZE = 512;

// Accepted input MIME types
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

// Fields safe to expose on a public profile.
const PUBLIC_USER_SELECT = {
	id: true,
	name: true,
	image: true,
	role: true,
	createdAt: true,
} as const;

// Fields returned on the authenticated user's own record.
const SELF_USER_SELECT = {
	id: true,
	name: true,
	email: true,
	image: true,
	role: true,
} as const;

// Fields returned to the admin users table
const ADMIN_USER_SELECT = {
	id: true,
	name: true,
	email: true,
	image: true,
	role: true,
} as const;

// Lightweight shape for the "find people to befriend" results list.
const SEARCH_USER_SELECT = {
	id: true,
	name: true,
	image: true,
} as const;

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	// Read
	async getMe(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: SELF_USER_SELECT,
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return user;
	}

	// Public profile of any user
	async getPublicProfile(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: PUBLIC_USER_SELECT,
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return user;
	}

	async getAllUsers() {
		const users = await this.prisma.user.findMany({
			select: ADMIN_USER_SELECT,
			orderBy: {
				createdAt: 'desc',
			},
		});

		return users;
	}

	// Search users by name (excluding existing relationships)
	async searchUsers(currentUserId: string, query: { q?: string; page?: number; limit?: number }) {
		const page = Math.max(1, query.page ?? 1);
		const limit = Math.min(50, Math.max(1, query.limit ?? 20));
		const skip = (page - 1) * limit;

		// Exclude users already having a relationship with current user
		const relationships = await this.prisma.friendship.findMany({
			where: {
				OR: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
			},
			select: { id: true, requesterId: true, addresseeId: true, acceptedAt: true },
		});

		const excludedIds = new Set<string>([currentUserId]);

		const where = {
			id: { notIn: Array.from(excludedIds) },
			...(query.q ? { name: { contains: query.q, mode: 'insensitive' as const } } : {}),
		};

		const [items, total] = await this.prisma.$transaction([
			this.prisma.user.findMany({
				where,
				select: SEARCH_USER_SELECT,
				orderBy: { name: 'asc' },
				skip,
				take: limit,
			}),
			this.prisma.user.count({ where }),
		]);

		let returnedItems: any[] = [];

		returnedItems = [...items];

		for (let i = 0; i < returnedItems.length; i++) {
			let hasRelationship = false;
			for (let j = 0; j < relationships.length; j++) {
				returnedItems[i].requestId = relationships[j].id;
				if (returnedItems[i].id == relationships[j].addresseeId) {
					hasRelationship = true;
					if (relationships[j].acceptedAt != null) {
						returnedItems[i].status = 'FRIEND';
					} else {
						returnedItems[i].status = 'FRIEND_REQUEST_SENT';
					}
					break;
				} else if (returnedItems[i].id == relationships[j].requesterId) {
					hasRelationship = true;
					if (relationships[j].acceptedAt != null) {
						returnedItems[i].status = 'FRIEND';
					} else {
						returnedItems[i].status = 'FRIEND_REQUEST_RECEIVED';
					}
					break;
				}
			}
			if (!hasRelationship) {
				returnedItems[i].status = 'NOT_FRIEND';
			}
		}

		return {
			items: returnedItems,
			total,
			page,
			limit,
			hasMore: skip + items.length < total,
		};
	}

	// Update profile
	async updateMe(userId: string, dto: UpdateUserDto) {
		await this.assertUserExists(userId);
		return this.applyUserUpdate(userId, dto);
	}

	// Admin: update another user's name and/or email
	async updateUserById(targetUserId: string, dto: UpdateUserDto) {
		await this.assertUserExists(targetUserId);
		return this.applyUserUpdate(targetUserId, dto);
	}

	// Admin: change another user's role
	async updateUserRole(targetUserId: string, role: string, requestingUserId: string) {
		if (!ALLOWED_ROLES.includes(role as AllowedRole)) {
			throw new BadRequestException('Invalid role');
		}

		if (targetUserId === requestingUserId) {
			throw new ForbiddenException('You cannot change your own role');
		}

		const target = await this.prisma.user.findUnique({
			where: { id: targetUserId },
			select: { id: true, role: true },
		});

		if (!target) {
			throw new NotFoundException('User not found');
		}

		// Prevent write if role is unchanged
		if (target.role === role) {
			return this.getAdminUserView(targetUserId);
		}

		await this.prisma.user.update({
			where: { id: targetUserId },
			data: { role },
		});

		return this.getAdminUserView(targetUserId);
	}

	// Update avatar

	async updateAvatar(userId: string, file: Express.Multer.File) {
		const existing = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, image: true },
		});

		if (!existing) {
			throw new NotFoundException('User not found');
		}

		if (!ALLOWED_MIME.has(file.mimetype)) {
			throw new BadRequestException('Unsupported image type');
		}

		// Process and format avatar image to square WebP
		let processed: Buffer;
		try {
			processed = await sharp(file.buffer)
				.rotate()
				.resize(AVATAR_SIZE, AVATAR_SIZE, {
					fit: 'cover',
					position: 'centre',
					withoutEnlargement: false,
				})
				.webp({ quality: 85 })
				.toBuffer();
		} catch {
			throw new BadRequestException('Invalid or corrupted image');
		}

		const filename = `${userId}-${Date.now()}-${randomUUID().slice(0, 8)}.webp`;
		const filepath = join(AVATAR_DIR, filename);

		await fs.mkdir(AVATAR_DIR, { recursive: true });
		await fs.writeFile(filepath, processed);

		// Delete previous non-default avatar
		if (existing.image !== DEFAULT_AVATAR) {
			const oldName = existing.image.split('/').pop();
			if (oldName) {
				await fs.unlink(join(AVATAR_DIR, oldName)).catch(() => undefined);
			}
		}

		const user = await this.prisma.user.update({
			where: { id: userId },
			data: { image: `/nest/uploads/avatars/${filename}` },
			select: SELF_USER_SELECT,
		});

		return user;
	}

	async deleteAvatar(userId: string) {
		const existing = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, image: true },
		});

		if (!existing) {
			throw new NotFoundException('User not found');
		}

		// Delete previous non-default avatar
		if (existing.image !== DEFAULT_AVATAR) {
			const oldName = existing.image.split('/').pop();
			if (oldName) {
				await fs.unlink(join(AVATAR_DIR, oldName)).catch(() => undefined);
			}
		}

		const user = await this.prisma.user.update({
			where: { id: userId },
			data: { image: DEFAULT_AVATAR },
			select: SELF_USER_SELECT,
		});

		return user;
	}

	// Delete current user account (self-deletion)
	async deleteMe(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, image: true },
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return this.performUserDeletion(user.id, user.image);
	}

	// Admin: delete user by id
	async deleteUser(targetUserId: string, requestingUserId: string) {
		if (targetUserId === requestingUserId) {
			throw new ForbiddenException('Use deleteMe to delete your own account');
		}

		const user = await this.prisma.user.findUnique({
			where: { id: targetUserId },
			select: { id: true, image: true },
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return this.performUserDeletion(user.id, user.image);
	}

	// Internal helpers
	// Updates user with email conflict check
	private async applyUserUpdate(userId: string, dto: UpdateUserDto) {
		// Only check email uniqueness if changed
		if (dto.email) {
			const conflict = await this.prisma.user.findUnique({
				where: { email: dto.email },
				select: { id: true },
			});

			if (conflict && conflict.id !== userId) {
				throw new ConflictException('Email already in use');
			}
		}

		const user = await this.prisma.user.update({
			where: { id: userId },
			data: {
				...(dto.name !== undefined && { name: dto.name }),
				...(dto.email !== undefined && { email: dto.email }),
			},
			select: ADMIN_USER_SELECT,
		});

		return user;
	}

	private async assertUserExists(userId: string) {
		const existing = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!existing) {
			throw new NotFoundException('User not found');
		}
	}

	// Formats user object for admin view
	private async getAdminUserView(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: ADMIN_USER_SELECT,
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return user;
	}

	// Deletes user record and clears avatar file
	private async performUserDeletion(userId: string, image: string) {
		// Best-effort avatar file cleanup
		if (image && image !== DEFAULT_AVATAR) {
			const oldName = image.split('/').pop();
			if (oldName) {
				await fs.unlink(join(AVATAR_DIR, oldName)).catch(() => undefined);
			}
		}

		await this.prisma.user.delete({
			where: { id: userId },
		});

		return {
			id: userId,
			deleted: true,
			deletedAt: new Date().toISOString(),
		};
	}
	async countUsers() {
		const count = await this.prisma.user.count();
		return { count };
	}
}
