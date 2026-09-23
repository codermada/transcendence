import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth';
import { AuthController } from './auth/auth.controller';

import { FriendModule } from './friend/friend.module';
import { PrismaModule } from './prisma/prisma.module';
import { TestModule } from './test/test.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { ProfileModule } from './feed/profile/profile.module.js';
import { PostLikeModule } from './post-like/post-like.module.js';
import { PostModule } from './post/post.module';
import { PresenceModule } from './presence/presence.module.js';
import { HealthCheckModule } from './health-check/health-check.module.js';
import { HealthModule } from './health/health.module';

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
		HealthCheckModule,
		HealthModule
	],
	controllers: [AuthController],
})
export class AppModule {}
