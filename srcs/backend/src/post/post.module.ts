import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../s3/s3.module';
import { PostController } from './post.controller';
import { PostRepository } from './post.repository';
import { PostService } from './post.service';

@Module({
	imports: [PrismaModule, S3Module],
	controllers: [PostController],
	providers: [PostService, PostRepository],
	exports: [PostService],
})
export class PostModule {}
