import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

const AVATAR_DIR = join(process.cwd(), 'uploads', 'avatars');
const DEFAULT_AVATAR = '/nest/uploads/default-avatar.png';

const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolves the avatar URL for a user, falling back to the default.
   * Keeps the DB value untouched — the fallback is a presentation concern.
   */
  private withAvatar<T extends { image: string | null }>(user: T) {
    return {
      ...user,
      image: user.image ?? DEFAULT_AVATAR,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.withAvatar(user);
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

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
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return this.withAvatar(user);
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, image: true },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      throw new BadRequestException('Unsupported image type');
    }

    const filename = `${userId}-${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    const filepath = join(AVATAR_DIR, filename);

    await fs.mkdir(AVATAR_DIR, { recursive: true });
    await fs.writeFile(filepath, file.buffer);

    // Delete the previous avatar file (best-effort).
    // Only delete if it's NOT the default and points to an uploaded file.
    if (existing.image && existing.image !== DEFAULT_AVATAR) {
      const oldName = existing.image.split('/').pop();
      if (oldName) {
        await fs.unlink(join(AVATAR_DIR, oldName)).catch(() => undefined);
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { image: `/nest/uploads/avatars/${filename}` },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return this.withAvatar(user);
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((u) => this.withAvatar(u));
  }
}