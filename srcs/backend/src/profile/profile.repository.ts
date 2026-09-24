import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                name: true,
                username: true,
                initials: true,
                friendsCount: true,
                postsCount: true,
                reactionsCount: true,
            },
        });
    }
}
