import { Module } from '@nestjs/common';
import { PostCommentController } from './post-comment.controller';
import { PostCommentService } from './post-comment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PostCommentRepository } from './post-comment.repository';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [PostCommentController],
  providers: [PostCommentService, PostCommentRepository],
  exports: [PostCommentService],
})
export class PostCommentModule {}
