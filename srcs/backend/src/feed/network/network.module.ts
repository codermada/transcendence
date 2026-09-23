import { Module } from '@nestjs/common';
import { FriendModule } from '../../friend/friend.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { S3Module } from '../../s3/s3.module';
import { NetworkController } from './network.controller';
import { NetworkRepository } from './network.repository';
import { NetworkService } from './network.service';

@Module({
	imports: [PrismaModule, S3Module, FriendModule],
	controllers: [NetworkController],
	providers: [NetworkService, NetworkRepository],
	exports: [NetworkService],
})
export class NetworkModule {}
