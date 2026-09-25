import { Module } from '@nestjs/common';
import { PostModule } from '../post/post.module';
import { PostRepository } from '../post/post.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../s3/s3.module';
import { PostCommentController } from './post-comment.controller';
import { PostCommentRepository } from './post-comment.repository';
import { PostCommentService } from './post-comment.service';

@Module({
  imports: [PrismaModule, S3Module, PostModule],
  controllers: [PostCommentController],
  providers: [PostCommentService, PostCommentRepository, PostRepository],
  exports: [PostCommentService],
})
export class PostCommentModule {}
