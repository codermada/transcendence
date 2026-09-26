import {
	CreateBucketCommand,
	DeleteObjectCommand,
	HeadBucketCommand,
	PutBucketCorsCommand,
	PutBucketPolicyCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { extname } from 'path';

@Injectable()
export class S3Service implements OnModuleInit {
	private s3Client: S3Client;
	private bucketName: string;
	private publicUrl: string;

	constructor() {
		this.bucketName = process.env.S3_BUCKET_NAME || 'uploads';
		this.publicUrl = process.env.S3_PUBLIC_URL || 'http://localhost:4566';

		this.s3Client = new S3Client({
			endpoint: process.env.S3_ENDPOINT || 'http://localstack:4566',
			region: process.env.S3_REGION || 'us-east-1',
			credentials: {
				accessKeyId: process.env.S3_ACCESS_KEY || 'test',
				secretAccessKey: process.env.S3_SECRET_KEY || 'test',
			},
			forcePathStyle: true,
			requestHandler: {
				...new (require('@smithy/node-http-handler').NodeHttpHandler)({
					socketTimeout: 3600,
				}),
			},
		});
	}

	private readonly logger = new Logger(S3Service.name);

	async onModuleInit() {
		await this.ensureBucketExists();
	}

	private async ensureBucketExists() {
		try {
			await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
		} catch {
			try {
				await this.s3Client.send(
					new CreateBucketCommand({
						Bucket: this.bucketName,
						ObjectOwnership: 'ObjectWriter',
					}),
				);
			} catch (err: unknown) {
				const error = err as {
					name?: string;
					Code?: string;
					$metadata?: { httpStatusCode?: number };
					message?: string;
				};
				if (
					error?.name !== 'BucketAlreadyExists' &&
					error?.name !== 'BucketAlreadyOwnedByYou' &&
					error?.Code !== 'BucketAlreadyExists' &&
					error?.Code !== 'BucketAlreadyOwnedByYou' &&
					error?.$metadata?.httpStatusCode !== 409
				) {
					this.logger.error(`Failed to create bucket ${this.bucketName}: ${error?.message || err}`);
				}
			}
		}

		try {
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
		} catch (err: unknown) {
			const error = err as { message?: string };
			this.logger.warn(`Could not set bucket policy: ${error?.message || err}`);
		}

		try {
			await this.s3Client.send(
				new PutBucketCorsCommand({
					Bucket: this.bucketName,
					CORSConfiguration: {
						CORSRules: [
							{
								AllowedOrigins: ['*'],
								AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
								AllowedHeaders: ['*'],
								ExposeHeaders: ['ETag', 'Content-Length', 'Content-Range', 'Accept-Ranges'],
								MaxAgeSeconds: 3600,
							},
						],
					},
				}),
			);
		} catch (err: unknown) {
			const error = err as { message?: string };
			this.logger.warn(`Could not set bucket CORS: ${error?.message || err}`);
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
				ACL: 'public-read',
			}),
		);

		return `${this.publicUrl}/${this.bucketName}/${key}`;
	}

	async deleteFile(fileUrl: string): Promise<void> {
		if (!fileUrl) return;

		try {
			const prefix = `${this.publicUrl}/${this.bucketName}/`;
			const key = fileUrl.replace(prefix, '');

			if (!key || key === fileUrl) return;

			await this.s3Client.send(
				new DeleteObjectCommand({
					Bucket: this.bucketName,
					Key: key,
				}),
			);
		} catch (error) {
			console.error(`Erreur lors de la suppression du fichier S3 (${fileUrl}):`, error);
		}
	}

	async deleteFiles(fileUrls: string[]): Promise<void> {
		if (!fileUrls || fileUrls.length === 0) return;
		await Promise.all(fileUrls.map((url) => this.deleteFile(url)));
	}
}
