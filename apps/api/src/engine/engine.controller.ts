import { Controller, Post, Query, UseGuards, Request } from '@nestjs/common';
import { EngineService } from './engine.service';
import { AuthGuard } from '../supabase/auth.guard';
import { ApiResponse, EvaluationResponse } from '@solo-leveling/shared';

@Controller('v1/engine')
@UseGuards(AuthGuard)
export class EngineController {
  constructor(private readonly engineService: EngineService) {}

  /**
   * POST /api/v1/engine/evaluate-day?day=YYYY-MM-DD
   * Evaluate all quests for a specific day
   */
  @Post('evaluate-day')
  async evaluateDay(
    @Request() req,
    @Query('day') day: string,
  ): Promise<ApiResponse<EvaluationResponse>> {
    const userId = req.user.id;

    // Default to today if no day specified
    const evaluationDay = day || new Date().toISOString().split('T')[0];

    const result = await this.engineService.evaluateDay(userId, evaluationDay);

    return {
      success: true,
      data: result,
      message: `Evaluated ${result.questResults.length} quests`,
    };
  }
}
