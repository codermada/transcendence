import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ToggleCommentLikeDto {
	@ApiProperty({
		description: 'ID of the comment to like or unlike',
		example: 'clx1234567890abcdef',
	})
	@IsString()
	@IsNotEmpty()
	commentId: string;
}
