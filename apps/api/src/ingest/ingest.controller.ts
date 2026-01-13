import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { DailyHealthSummaryDto } from './dto/daily-health-summary.dto';
import { ManualStepsDto } from './dto/manual-steps.dto';
import { AuthGuard } from '../supabase/auth.guard';
import { ApiResponse } from '@solo-leveling/shared';

@Controller('v1/ingest/health')
@UseGuards(AuthGuard)
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  /**
   * POST /api/v1/ingest/health/daily-summary
   * Receives daily health data from Android Health Connect
   */
  @Post('daily-summary')
  async ingestDailySummary(
    @Request() req,
    @Body() dto: DailyHealthSummaryDto,
  ): Promise<ApiResponse> {
    const userId = req.user.id;
    const result = await this.ingestService.ingestDailySummary(userId, dto);

    return {
      success: true,
      data: result,
      message: result.message,
    };
  }

  /**
   * POST /api/v1/ingest/health/manual-steps
   * Receives manually logged steps from web interface
   */
  @Post('manual-steps')
  async logManualSteps(
    @Request() req,
    @Body() dto: ManualStepsDto,
  ): Promise<ApiResponse> {
    const userId = req.user.id;
    const result = await this.ingestService.logManualSteps(userId, dto);

    return {
      success: true,
      data: result,
      message: result.message,
    };
  }
}
