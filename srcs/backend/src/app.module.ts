import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth'; // your better-auth instance

import { PrismaModule } from './prisma/prisma.module';
import { TestModule } from './test/test.module';
import { UserModule } from './user/user.module';
import { FriendModule } from './friend/friend.module';
// import { ChatModule } from './chat/chat.module';
import { PresenceModule } from './presence/presence.module.js';

@Module({
  imports: [
    AuthModule.forRoot({ auth }), // <-- Add this
    PrismaModule,
    TestModule,
    UserModule,
    FriendModule,
    // ChatModule,
    PresenceModule
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}