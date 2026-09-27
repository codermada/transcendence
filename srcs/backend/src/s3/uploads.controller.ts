import { Controller, Get, Headers, NotFoundException, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { S3Service } from './s3.service';

@Controller('uploads')
export class UploadsController {
	constructor(private readonly s3Service: S3Service) {}

	@Get('*')
	async getFile(@Req() req: Request, @Headers('range') range: string, @Res() res: Response) {
		const rawPath = decodeURIComponent(req.path || req.url.split('?')[0]);
		const uploadsIndex = rawPath.indexOf('/uploads/');
		let key = '';

		if (uploadsIndex !== -1) {
			key = rawPath.substring(uploadsIndex + '/uploads/'.length);
		} else {
			key = rawPath.replace(/^\//, '');
		}

		key = key.replace(/,/g, '/');

		if (!key) {
			throw new NotFoundException('Key missing');
		}

		try {
			const { stream, contentType, contentLength, contentRange, acceptRanges, httpStatusCode } =
				await this.s3Service.getFileStream(key, range);

			res.status(httpStatusCode || 200);

			if (contentType) res.setHeader('Content-Type', contentType);
			if (contentLength) res.setHeader('Content-Length', contentLength.toString());
			if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);
			if (contentRange) res.setHeader('Content-Range', contentRange);

			res.setHeader('Cache-Control', 'public, max-age=31536000');

			stream.pipe(res);
		} catch {
			throw new NotFoundException('File not found');
		}
	}
}
