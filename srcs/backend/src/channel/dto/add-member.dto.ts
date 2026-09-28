import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AddMemberDto {
	@ApiProperty({ description: 'The ID of the member to add to the channel' })
	@IsString()
	@IsNotEmpty()
	memberId: string;
}