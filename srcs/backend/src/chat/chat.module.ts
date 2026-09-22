import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { PrismaModule } from "../prisma/prisma.module";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { S3Module } from "../s3/s3.module";

@Module({
	imports: [PrismaModule, S3Module],
	controllers: [ChatController],
	providers: [ChatService, ChatGateway],
	exports: [ChatService, ChatGateway],
})
export class ChatModule {}