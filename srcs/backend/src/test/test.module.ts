// test.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth'; // <-- Add this
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { ApiKeyGuard } from '../auth/ApiKeyGuard';


@Module({
  imports: [AuthModule], // <-- Makes AuthService available
  controllers: [TestController],
  providers: [TestService, ApiKeyGuard], // <-- Register the guard
})
export class TestModule {}