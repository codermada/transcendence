import { Global, Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { UploadsController } from './uploads.controller';

@Global()
@Module({
	controllers: [UploadsController],
	providers: [S3Service],
	exports: [S3Service],
})
export class S3Module {}
