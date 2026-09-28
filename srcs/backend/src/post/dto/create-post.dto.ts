import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
	@IsString()
	@IsNotEmpty({ message: "Content can't be empty" })
	content: string;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	mediaUrls?: string[];
}
