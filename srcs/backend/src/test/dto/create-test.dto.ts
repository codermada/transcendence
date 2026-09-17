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
  /**
   * The name of the test
   * @example 'My first test'
   */
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  /**
   * Optional description shown in the UI
   * @example 'This is a sample test'
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /**
   * Numeric difficulty level (1-10)
   * @example 5
   */
  @IsInt()
  @Min(1)
  @Max(10)
  difficulty: number;

  /**
   * Whether the test is enabled
   * @example true
   */
  @IsBoolean()
  enabled: boolean;

  /**
   * Contact email for this test
   * @example 'owner@example.com'
   */
  @IsEmail()
  contactEmail: string;

  /**
   * Current status of the test
   * @example 'draft'
   */
  @IsEnum(TestStatus)
  status: TestStatus;

  /**
   * Tags associated with the test
   * @example ['smoke', 'regression']
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tags?: string[];

  /**
   * When the test should run
   * @example '2026-01-01T00:00:00.000Z'
   */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;
}