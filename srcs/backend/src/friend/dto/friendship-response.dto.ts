import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FriendshipStatus } from '@prisma/client';

class FriendUserDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() pseudo?: string | null;
  @ApiPropertyOptional() image?: string | null;
}

export class FriendshipResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ enum: FriendshipStatus }) status: FriendshipStatus;
  @ApiProperty() pairKey: string;
  @ApiPropertyOptional() message?: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiPropertyOptional() acceptedAt?: Date | null;
  @ApiPropertyOptional() rejectedAt?: Date | null;
  @ApiPropertyOptional() blockedAt?: Date | null;
  @ApiPropertyOptional() cancelledAt?: Date | null;
  @ApiProperty({ type: FriendUserDto }) requester: FriendUserDto;
  @ApiProperty({ type: FriendUserDto }) addressee: FriendUserDto;
  @ApiPropertyOptional({ type: FriendUserDto }) blockedBy?: FriendUserDto | null;
}