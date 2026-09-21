import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { auth } from './auth/auth'; // your better-auth instance
import { AuthController } from './auth/auth.controller';

import { FriendModule } from './friend/friend.module';
import { PrismaModule } from './prisma/prisma.module';
import { TestModule } from './test/test.module';
import { UserModule } from './user/user.module';
// import { ChatModule } from './chat/chat.module';
import { ProfileModule } from './feed/profile/profile.module.js';
import { PostLikeModule } from './post-like/post-like.module.js';
import { PostModule } from './post/post.module';
import { PresenceModule } from './presence/presence.module.js';

@Module({
	imports: [
		AuthModule.forRoot({ auth }),
		PrismaModule,
		TestModule,
		UserModule,
		FriendModule,
		// ChatModule,
		PresenceModule,
		PostModule,
		PostLikeModule,
		ProfileModule,
	],
	controllers: [AppController, AuthController],
	providers: [AppService],
})
export class AppModule {}
