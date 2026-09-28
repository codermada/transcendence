import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PostLikeController } from './post-like.controller';
import { PostLikeRepository } from './post-like.repository';
import { PostLikeService } from './post-like.service';

@Module({
	imports: [PrismaModule],
	controllers: [PostLikeController],
	providers: [PostLikeService, PostLikeRepository],
	exports: [PostLikeService],
})
export class PostLikeModule {}
