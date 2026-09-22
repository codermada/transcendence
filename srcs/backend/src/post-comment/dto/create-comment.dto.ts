import {IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
	@IsString()
	@IsNotEmpty({ message: 'Le contenu ne peut pas être vide' })
	content: string;

	@IsString()
	@IsNotEmpty({ message: 'L\'ID du post ne peut pas être vide' })
	postId: string;


    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Le mediaUrl ne peut pas être vide' })
    mediaUrl?: string;
}

