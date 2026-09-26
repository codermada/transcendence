import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SendChannelMessageDto {
  @ApiPropertyOptional({ description: 'The content of the message to send (can be empty if only sending attachments)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;
}
