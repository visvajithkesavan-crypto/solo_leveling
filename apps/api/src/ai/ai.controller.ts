import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AiQuestService } from './ai-quest.service';
import { AuthGuard } from '../supabase/auth.guard';
import { ApiResponse } from '@solo-leveling/shared';

@Controller('v1/ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiQuestService: AiQuestService) {}

  /**
   * POST /api/v1/ai/generate-quests
   * Generate personalized daily quests using AI
   */
  @Post('generate-quests')
  async generateQuests(@Request() req): Promise<ApiResponse> {
    const userId = req.user.id;
    
    const quests = await this.aiQuestService.generateDailyQuests(userId);
    await this.aiQuestService.saveGeneratedQuests(userId, quests);
    
    return {
      success: true,
      data: quests,
      message: '◇ Daily quests have been assigned, Hunter.',
    };
  }

  /**
   * GET /api/v1/ai/preview-quests
   * Preview generated quests without saving
   */
  @Get('preview-quests')
  async previewQuests(@Request() req): Promise<ApiResponse> {
    const userId = req.user.id;
    
    const quests = await this.aiQuestService.generateDailyQuests(userId);
    
    return {
      success: true,
      data: quests,
      message: '◇ Quest preview generated.',
    };
  }
}
