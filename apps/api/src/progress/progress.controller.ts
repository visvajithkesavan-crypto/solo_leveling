import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { AuthGuard } from '../supabase/auth.guard';
import { ApiResponse, StatusWindow } from '@solo-leveling/shared';

@Controller('v1/progress')
@UseGuards(AuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  /**
   * GET /api/v1/progress/status-window
   * Get current level, XP, and streak data
   */
  @Get('status-window')
  async getStatusWindow(@Request() req): Promise<ApiResponse<StatusWindow>> {
    const userId = req.user.id;
    const data = await this.progressService.getStatusWindow(userId);

    return {
      success: true,
      data,
    };
  }
}
