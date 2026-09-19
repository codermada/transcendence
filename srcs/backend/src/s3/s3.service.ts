import {
	CreateBucketCommand,
	HeadBucketCommand,
	PutBucketPolicyCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { extname } from 'path';

@Injectable()
export class S3Service implements OnModuleInit {
	private s3Client: S3Client;
	private bucketName: string;
	private publicUrl: string;

	constructor() {
		this.bucketName = process.env.S3_BUCKET_NAME || 'uploads';
		this.publicUrl = process.env.S3_PUBLIC_URL || 'http://localhost:9002';

		this.s3Client = new S3Client({
			endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
			region: process.env.S3_REGION || 'us-east-1',
			credentials: {
				accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
				secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
			},
			forcePathStyle: true,
		});
	}

	async onModuleInit() {
		await this.ensureBucketExists();
	}

	private async ensureBucketExists() {
		try {
			await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
		} catch {
			await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
			const policy = {
				Version: '2012-10-17',
				Statement: [
					{
						Sid: 'PublicRead',
						Effect: 'Allow',
						Principal: '*',
						Action: ['s3:GetObject'],
						Resource: [`arn:aws:s3:::${this.bucketName}/*`],
					},
				],
			};

			await this.s3Client.send(
				new PutBucketPolicyCommand({
					Bucket: this.bucketName,
					Policy: JSON.stringify(policy),
				}),
			);
		}
	}

	async uploadFile(file: Express.Multer.File, folder = 'posts'): Promise<string> {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = extname(file.originalname);
		const key = `${folder}/${uniqueSuffix}${ext}`;

		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
			}),
		);

		return `${this.publicUrl}/${this.bucketName}/${key}`;
	}
}
