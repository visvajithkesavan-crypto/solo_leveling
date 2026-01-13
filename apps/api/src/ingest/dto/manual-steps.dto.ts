import { IsInt, Min, IsOptional, IsDateString } from 'class-validator';

/**
 * DTO for manually logged steps from web interface
 */
export class ManualStepsDto {
  @IsInt()
  @Min(0)
  steps: number;

  @IsDateString()
  @IsOptional()
  day?: string; // YYYY-MM-DD format, defaults to today
}
