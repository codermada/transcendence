import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { S3Module } from '../../s3/s3.module';
import { ProfileController } from './profile.controller';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';

@Module({
	imports: [PrismaModule, S3Module],
	controllers: [ProfileController],
	providers: [ProfileService, ProfileRepository],
	exports: [ProfileService],
})
export class ProfileModule {}
