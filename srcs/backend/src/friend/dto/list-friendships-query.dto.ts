import { ApiPropertyOptional } from '@nestjs/swagger';
import { FriendshipStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListFriendshipsQueryDto {
  @ApiPropertyOptional({ enum: FriendshipStatus })
  @IsOptional()
  @IsEnum(FriendshipStatus)
  status?: FriendshipStatus;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Case-insensitive search on name / pseudo' })
  @IsOptional()
  @IsString()
  search?: string;
}