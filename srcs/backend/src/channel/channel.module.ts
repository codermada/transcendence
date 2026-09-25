import { Module } from "@nestjs/common";
import { ChannelService } from "./channel.service";
import { S3Module } from "../s3/s3.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ChannelController } from "./channel.controller";
import { ChannelGateway } from "./channel.gateway";

@Module({
	imports: [S3Module, PrismaModule],
	controllers: [ChannelController],
	providers: [ChannelService, ChannelGateway],
	exports: [ChannelService, ChannelGateway]
})
export class ChannelModule {}
