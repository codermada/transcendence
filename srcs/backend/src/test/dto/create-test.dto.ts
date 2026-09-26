import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsDate,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

// Optional: define an enum for a field
export enum TestStatus {
  Draft = 'draft',
  Active = 'active',
  Archived = 'archived',
}

export class CreateTestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  difficulty: number;

  @IsBoolean()
  enabled: boolean;

  @IsEmail()
  contactEmail: string;

  @IsEnum(TestStatus)
  status: TestStatus;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;
}