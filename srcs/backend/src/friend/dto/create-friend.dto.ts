import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFriendDto {
  @ApiProperty({ description: 'ID of the user to send a friend request to' })
  @IsString()
  @IsNotEmpty()
  addresseeId: string;

  @ApiPropertyOptional({
    description: 'Optional message attached to the friend request',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}