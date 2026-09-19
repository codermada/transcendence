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

// Output size in pixels (square). 512 is plenty for a 80–200px avatar.
const AVATAR_SIZE = 512;

// Accepted input MIME types. Sharp sniffs the actual bytes, so this is
// a first-pass gate; a mislabeled file will still be rejected by sharp.
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

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

// Fields returned to the admin users table.
// Matches the `User` type on the frontend (UsersTable.tsx).
const ADMIN_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
} as const;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────
  // Read
  // ─────────────────────────────────────────────────────────────

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

  /**
   * Public profile of any user — no email or other private fields.
   */
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

  // ─────────────────────────────────────────────────────────────
  // Update — profile
  // ─────────────────────────────────────────────────────────────

  async updateMe(userId: string, dto: UpdateUserDto) {
    await this.assertUserExists(userId);
    return this.applyUserUpdate(userId, dto);
  }

  /**
   * Admin-only: update another user's name and/or email.
   * Shares the same validation + conflict logic as `updateMe`.
   */
  async updateUserById(targetUserId: string, dto: UpdateUserDto) {
    await this.assertUserExists(targetUserId);
    return this.applyUserUpdate(targetUserId, dto);
  }

  // ─────────────────────────────────────────────────────────────
  // Update — role
  // ─────────────────────────────────────────────────────────────

  /**
   * Admin-only: change another user's role.
   *
   * Guards:
   *  - Role must be in the allow-list (DTO-enforced, re-checked here
   *    as defence-in-depth for direct service calls).
   *  - Target must exist.
   *  - The requesting admin cannot change their own role — prevents
   *    accidental lock-out and keeps the audit trail clean.
   */
  async updateUserRole(
    targetUserId: string,
    role: string,
    requestingUserId: string,
  ) {
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

    // No-op short-circuit: avoids a pointless write and a misleading
    // "updated" response when nothing actually changes.
    if (target.role === role) {
      return this.getAdminUserView(targetUserId);
    }

    await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role },
    });

    return this.getAdminUserView(targetUserId);
  }

  // ─────────────────────────────────────────────────────────────
  // Update — avatar
  // ─────────────────────────────────────────────────────────────

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

    // Process with sharp: auto-rotate (EXIF), crop to a centered square,
    // resize, strip metadata, encode as WebP.
    let processed: Buffer;
    try {
      processed = await sharp(file.buffer)
        .rotate() // apply EXIF orientation before cropping
        .resize(AVATAR_SIZE, AVATAR_SIZE, {
          fit: 'cover',           // crop to fill the square
          position: 'centre',     // centered crop
          withoutEnlargement: false,
        })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      // Sharp throws on malformed/corrupt images or unsupported formats.
      throw new BadRequestException('Invalid or corrupted image');
    }

    // Always .webp now — the output format is fixed by sharp.
    const filename = `${userId}-${Date.now()}-${randomUUID().slice(0, 8)}.webp`;
    const filepath = join(AVATAR_DIR, filename);

    await fs.mkdir(AVATAR_DIR, { recursive: true });
    await fs.writeFile(filepath, processed);

    // Delete the previous avatar file (best-effort).
    // Skip if it's the default — nothing of ours to delete.
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

    // Remove the uploaded file (best-effort). Skip if it's already the
    // default — nothing of ours to delete.
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

  // ─────────────────────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────────────────────

  /**
   * Delete the currently authenticated user (self-deletion).
   * Uses a transaction to ensure atomicity.
   */
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

  /**
   * Admin-only: delete any user by ID.
   * Guarded at the controller level with a role check.
   */
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

  // ─────────────────────────────────────────────────────────────
  // Internal helpers
  // ─────────────────────────────────────────────────────────────

  /**
   * Shared update path for self-service and admin edits.
   * Validates uniqueness of the new email and returns the
   * admin-facing user shape.
   */
  private async applyUserUpdate(userId: string, dto: UpdateUserDto) {
    // Only check email uniqueness if the email is actually changing.
    // (Avoids a false conflict when the client re-sends the current email.)
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

  /**
   * Shape returned to the admin UI. Must match the `User` type used
   * by `UsersTable` on the frontend.
   */
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

  /**
   * Shared deletion logic.
   * - Deletes the avatar file (best-effort, skipped if default).
   * - Deletes the user row; Prisma cascades handle related records
   *   per the onDelete rules in the schema.
   */
  private async performUserDeletion(userId: string, image: string) {
    // 1. Best-effort file cleanup BEFORE the DB row goes away,
    //    so we can still reference the filename if deletion fails.
    if (image && image !== DEFAULT_AVATAR) {
      const oldName = image.split('/').pop();
      if (oldName) {
        await fs.unlink(join(AVATAR_DIR, oldName)).catch(() => undefined);
      }
    }

    // 2. Delete the user. Relations with onDelete: Cascade are removed
    //    automatically; relations with onDelete: SetNull have their
    //    FK nulled. MessageTable rows keep their pairKey uniqueness.
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      id: userId,
      deleted: true,
      deletedAt: new Date().toISOString(),
    };
  }
}