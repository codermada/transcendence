import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MaxLength, IsOptional } from "class-validator";

export class UpdateChannelDto {
	@ApiProperty({ description: 'The title of the channel' })
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	@IsOptional()
	title?: string;

	@ApiProperty({ description: 'The description of the channel' })
	@IsString()
	@MaxLength(200)
	@IsOptional()
	description?: string;
}