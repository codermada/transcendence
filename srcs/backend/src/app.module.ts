import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth';
import { AuthController } from './auth/auth.controller';

import { ChatModule } from './chat/chat.module';
import { NetworkModule } from './feed/network/network.module.js';
import { ProfileModule } from './feed/profile/profile.module.js';
import { FriendModule } from './friend/friend.module';
import { HealthCheckModule } from './health-check/health-check.module.js';
import { PostLikeModule } from './post-like/post-like.module.js';
import { PostModule } from './post/post.module';
import { PresenceModule } from './presence/presence.module.js';
import { PrismaModule } from './prisma/prisma.module';
import { TestModule } from './test/test.module';
import { UserModule } from './user/user.module';
import { PostCommentModule } from './post-comment/post-comment.module';

@Module({
	imports: [
		AuthModule.forRoot({ auth }),
		PrismaModule,
		TestModule,
		UserModule,
		FriendModule,
		ChatModule,
		PresenceModule,
		PostModule,
		PostLikeModule,
		ProfileModule,
		NetworkModule,
		HealthCheckModule,
		PostCommentModule,
	],
	controllers: [AuthController],
})
export class AppModule {}
