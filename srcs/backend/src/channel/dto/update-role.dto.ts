import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ChannelRoleEnum {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export class UpdateRoleDto {
  @ApiProperty({ enum: ChannelRoleEnum, description: 'The role to update the user to' })
  @IsEnum(ChannelRoleEnum)
  @IsNotEmpty()
  role: ChannelRoleEnum;
}