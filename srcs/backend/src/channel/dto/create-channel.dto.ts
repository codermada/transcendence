import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateChannelDto {
	@ApiProperty({ description: 'The title of the channel' })
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	title: string;

	@ApiProperty({ description: 'The description of the channel' })
	@IsString()
	@MaxLength(200)
	description: string;

	@ApiPropertyOptional({ description: 'The IDs of the members to add to the channel' })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	membersIds?: string[];
}