import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthController } from './auth/auth.controller';



import { PrismaModule } from './prisma/prisma.module';
import { TestModule } from './test/test.module';


@Module({
  imports: [ PrismaModule, TestModule ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
