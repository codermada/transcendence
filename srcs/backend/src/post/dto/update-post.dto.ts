// src/posts/dto/update-post.dto.ts
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
	@IsString()
	@IsOptional()
	content?: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Transform(({ value }) => {
		if (typeof value === 'string') return [value];
		if (Array.isArray(value)) return value;
		return [];
	})
	mediaUrls?: string[];
}
