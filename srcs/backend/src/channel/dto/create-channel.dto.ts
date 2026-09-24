import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateChannelDto {
	@ApiProperty({description: 'The title of the channel'})
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	title: string;

	@ApiProperty({description: 'The description of the channel'})
	@IsString()
	@MaxLength(200)
	description: string;

	@ApiProperty({description: 'The IDs of the members to add to the channel'})
	@IsString({ each: true })
	membersIds?: string[];
}