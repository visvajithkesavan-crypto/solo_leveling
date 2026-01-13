import { IsString, IsInt, IsDateString, Min } from 'class-validator';

/**
 * DTO for daily health summary from Android Health Connect
 */
export class DailyHealthSummaryDto {
  @IsDateString()
  day: string; // YYYY-MM-DD format

  @IsInt()
  @Min(0)
  steps: number;

  @IsString()
  dataOrigin: string; // e.g., "com.google.android.apps.fitness"

  @IsDateString()
  computedAt: string; // ISO timestamp when data was read
}
