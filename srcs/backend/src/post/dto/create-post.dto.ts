import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
	@IsString()
	@IsNotEmpty({ message: 'Le contenu ne peut pas être vide' })
	content: string;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	mediaUrls?: string[];
}