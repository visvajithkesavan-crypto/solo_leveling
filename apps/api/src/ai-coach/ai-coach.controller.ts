/**
 * Solo Leveling System - AI Coach Controller
 * 
 * REST API endpoints for the AI coaching system including
 * goal setting, quest management, and performance reviews.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '../supabase/auth.guard';
import { GoalAnalyzerService } from './goal-analyzer.service';
import { QuestGeneratorService } from './quest-generator.service';
import { PerformanceAnalyzerService } from './performance-analyzer.service';
import { MilestoneTrackerService } from './milestone-tracker.service';
import { QuestSchedulerService } from './quest-scheduler.service';
import { OpenAIService } from './openai.service';
import { HonestRankingService } from './honest-ranking.service';
import { AssessmentService } from './assessment.service';
import {
  ISetGoalRequest,
  ISetGoalResponse,
  IGetDailyQuestsResponse,
  IAICoachStatus,
  ICompleteQuestRequest,
  ICompleteQuestResponse,
} from './interfaces';
import { SupabaseClient } from '@supabase/supabase-js';
import { Inject } from '@nestjs/common';

@Controller('v1/ai-coach')
@UseGuards(AuthGuard)
export class AICoachController {
  private readonly logger = new Logger(AICoachController.name);

  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    private readonly goalAnalyzer: GoalAnalyzerService,
    private readonly questGenerator: QuestGeneratorService,
    private readonly performanceAnalyzer: PerformanceAnalyzerService,
    private readonly milestoneTracker: MilestoneTrackerService,
    private readonly questScheduler: QuestSchedulerService,
    private readonly honestRanking: HonestRankingService,
    private readonly assessment: AssessmentService,
    private readonly openai: OpenAIService,
  ) {}

  // ============================================================================
  // AI SERVICE STATUS ENDPOINTS
  // ============================================================================

  /**
   * Check AI service health and configuration
   * GET /api/v1/ai-coach/ai-status
   * 
   * Returns information about the configured AI provider,
   * model, and whether the service is healthy.
   */
  @Get('ai-status')
  async getAIStatus(): Promise<{
    success: boolean;
    data: {
      healthy: boolean;
      provider: string;
      model: string;
      baseUrl: string;
      isFree: boolean;
      description: string;
      error?: string;
    };
  }> {
    const health = await this.openai.checkHealth();
    const info = this.openai.getProviderInfo();
    
    return {
      success: health.healthy,
      data: {
        healthy: health.healthy,
        provider: health.provider,
        model: health.model,
        baseUrl: health.baseUrl,
        isFree: info.isFree,
        description: info.description,
        error: health.error,
      },
    };
  }

  // ============================================================================
  // HONEST RANKING & ASSESSMENT ENDPOINTS
  // ============================================================================

  /**
   * Get all available goal categories for honest ranking
   * GET /api/v1/ai-coach/categories
   */
  @Get('categories')
  async getCategories(): Promise<{
    success: boolean;
    data: { id: string; name: string; description: string }[];
  }> {
    const categories = this.honestRanking.getAllCategories().map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
    }));
    return { success: true, data: categories };
  }

  /**
   * Start an honest assessment session
   * POST /api/v1/ai-coach/assessment/start
   */
  @Post('assessment/start')
  async startAssessment(
    @Request() req: any,
    @Body() body: { goalText: string; healthData?: Record<string, any> },
  ): Promise<{
    success: boolean;
    data: {
      sessionId: string;
      category: { id: string; name: string; description: string };
      introMessage: string;
      questions: { id: string; question: string; type: string; required?: boolean }[];
    };
  }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (!body.goalText || body.goalText.trim().length < 5) {
      throw new HttpException(
        'Goal text must be at least 5 characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.assessment.startAssessment(
        userId,
        body.goalText.trim(),
        body.healthData,
      );

      return {
        success: true,
        data: {
          sessionId: result.sessionId,
          category: {
            id: result.category.id,
            name: result.category.name,
            description: result.category.description,
          },
          introMessage: result.introMessage,
          questions: result.questions,
        },
      };
    } catch (error) {
      this.logger.error('Failed to start assessment:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to start assessment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Submit assessment answers and get honest rank
   * POST /api/v1/ai-coach/assessment/submit
   */
  @Post('assessment/submit')
  async submitAssessment(
    @Request() req: any,
    @Body() body: { sessionId: string; answers: Record<string, number | string | boolean> },
  ): Promise<{
    success: boolean;
    data: {
      assessment: {
        currentRank: string;
        percentile: number;
        goalCategory: string;
        honestTruth: string;
        topOnePercentLooksLike: string;
        gapToTopOnePercent: string[];
        estimatedYearsToTop: number;
        immediateActions: string[];
        growthMindsetMessage: string;
        metrics: {
          name: string;
          currentValue: number | string;
          unit: string;
          percentile: number;
          topOnePercentValue: string;
        }[];
      };
      followUpMessage: string;
    };
  }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (!body.sessionId) {
      throw new HttpException('Session ID is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.assessment.submitAnswers(
        body.sessionId,
        body.answers,
      );

      // Store assessment in database
      const session = this.assessment.getSession(body.sessionId);
      if (session) {
        await this.storeAssessment(userId, session, result.assessment);
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to submit assessment:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to submit assessment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get rank benchmarks for a category
   * GET /api/v1/ai-coach/benchmarks/:categoryId
   */
  @Get('benchmarks/:categoryId')
  async getBenchmarks(
    @Param('categoryId') categoryId: string,
  ): Promise<{
    success: boolean;
    data: {
      category: string;
      benchmarks: { rank: string; description: string }[];
    } | null;
  }> {
    const category = this.honestRanking.getCategory(categoryId);
    if (!category) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        category: category.name,
        benchmarks: category.benchmarks.map(b => ({
          rank: b.rank,
          description: b.description,
        })),
      },
    };
  }

  /**
   * Get user's current honest rank for their active goal
   * GET /api/v1/ai-coach/my-rank
   */
  @Get('my-rank')
  async getMyRank(@Request() req: any): Promise<{
    success: boolean;
    data: {
      hasRank: boolean;
      rank?: string;
      percentile?: number;
      goalCategory?: string;
      assessedAt?: string;
    };
  }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      // Get latest assessment for user
      const { data: assessment } = await this.supabase
        .from('user_fitness_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('assessed_at', { ascending: false })
        .limit(1)
        .single();

      if (!assessment) {
        return { success: true, data: { hasRank: false } };
      }

      return {
        success: true,
        data: {
          hasRank: true,
          rank: assessment.honest_rank,
          percentile: assessment.percentile,
          goalCategory: assessment.goal_category,
          assessedAt: assessment.assessed_at,
        },
      };
    } catch (error) {
      return { success: true, data: { hasRank: false } };
    }
  }

  /**
   * Get rank progression history
   * GET /api/v1/ai-coach/rank-history
   */
  @Get('rank-history')
  async getRankHistory(@Request() req: any): Promise<{
    success: boolean;
    data: {
      oldRank: string | null;
      newRank: string;
      oldPercentile: number | null;
      newPercentile: number;
      reason: string;
      recordedAt: string;
    }[];
  }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const { data: history } = await this.supabase
        .from('rank_progression_history')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(20);

      return {
        success: true,
        data: (history || []).map((h: any) => ({
          oldRank: h.old_rank,
          newRank: h.new_rank,
          oldPercentile: h.old_percentile,
          newPercentile: h.new_percentile,
          reason: h.reason,
          recordedAt: h.recorded_at,
        })),
      };
    } catch (error) {
      return { success: true, data: [] };
    }
  }

  /**
   * Store assessment in database
   */
  private async storeAssessment(
    userId: string,
    session: any,
    assessment: any,
  ): Promise<void> {
    try {
      await this.supabase.from('user_fitness_assessments').insert({
        user_id: userId,
        goal_category: session.detectedCategory.id,
        goal_text: session.goalText,
        honest_rank: assessment.currentRank,
        percentile: assessment.percentile,
        assessment_data: {
          honestTruth: assessment.honestTruth,
          topOnePercentLooksLike: assessment.topOnePercentLooksLike,
          gapToTopOnePercent: assessment.gapToTopOnePercent,
          estimatedYearsToTop: assessment.estimatedYearsToTop,
          immediateActions: assessment.immediateActions,
          growthMindsetMessage: assessment.growthMindsetMessage,
        },
        metrics: assessment.metrics,
        health_data_used: !!session.healthData,
        user_answers: session.userAnswers,
      });
    } catch (error) {
      this.logger.error('Failed to store assessment:', error);
      // Don't throw - this is not critical
    }
  }

  // ============================================================================
  // ORIGINAL GOAL & QUEST ENDPOINTS
  // ============================================================================

  /**
   * Set a new goal and generate master plan
   * POST /api/v1/ai-coach/set-goal
   */
  @Post('set-goal')
  async setGoal(
    @Request() req: any,
    @Body() body: ISetGoalRequest,
  ): Promise<{ success: boolean; data: ISetGoalResponse }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (!body.goalText || body.goalText.trim().length < 10) {
      throw new HttpException(
        'Goal text must be at least 10 characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.goalAnalyzer.analyzeAndCreatePlan(
        userId,
        body.goalText.trim(),
        body.timelineDays || 90,
      );

      // Generate initial quests
      await this.questGenerator.generateDailyQuests(userId);

      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Failed to set goal:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to set goal',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get the user's master plan
   * GET /api/v1/ai-coach/master-plan
   */
  @Get('master-plan')
  async getMasterPlan(@Request() req: any): Promise<{
    success: boolean;
    data: {
      goal: any;
      masterPlan: any;
    } | null;
  }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const goal = await this.goalAnalyzer.getActiveGoal(userId);
      if (!goal) {
        return { success: true, data: null };
      }

      const masterPlan = await this.goalAnalyzer.getMasterPlan(goal.id);

      return {
        success: true,
        data: {
          goal,
          masterPlan,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get master plan:', error);
      throw new HttpException(
        'Failed to get master plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get today's AI-generated quests
   * GET /api/v1/ai-coach/daily-quests
   */
  @Get('daily-quests')
  async getDailyQuests(@Request() req: any): Promise<{
    success: boolean;
    data: IGetDailyQuestsResponse;
  }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const result = await this.questGenerator.getTodaysQuests(userId);
      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Failed to get daily quests:', error);
      throw new HttpException(
        'Failed to get daily quests',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Regenerate daily quests
   * POST /api/v1/ai-coach/regenerate-quests
   */
  @Post('regenerate-quests')
  async regenerateQuests(
    @Request() req: any,
    @Body() body: { reason?: string },
  ): Promise<{
    success: boolean;
    data: IGetDailyQuestsResponse;
    message: string;
  }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const result = await this.questGenerator.regenerateQuests(userId, body.reason);
      return {
        success: true,
        data: result,
        message: `◇ [QUESTS REGENERATED] ◇ New challenges await, Hunter. Regenerations remaining: ${result.regenerationsRemaining}`,
      };
    } catch (error) {
      this.logger.error('Failed to regenerate quests:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to regenerate quests',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Complete a quest
   * POST /api/v1/ai-coach/complete-quest
   */
  @Post('complete-quest')
  async completeQuest(
    @Request() req: any,
    @Body() body: ICompleteQuestRequest,
  ): Promise<{ success: boolean; data: ICompleteQuestResponse }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (!body.questId) {
      throw new HttpException('Quest ID required', HttpStatus.BAD_REQUEST);
    }

    try {
      // Get the quest
      const { data: quest, error: questError } = await this.supabase
        .from('ai_daily_quests')
        .select('*')
        .eq('id', body.questId)
        .eq('user_id', userId)
        .single();

      if (questError || !quest) {
        throw new HttpException('Quest not found', HttpStatus.NOT_FOUND);
      }

      if (quest.status === 'completed') {
        throw new HttpException('Quest already completed', HttpStatus.BAD_REQUEST);
      }

      // Update quest status
      const completedAt = new Date().toISOString();
      await this.supabase
        .from('ai_daily_quests')
        .update({
          status: 'completed',
          completed_at: completedAt,
          current_value: body.actualValue || quest.target_value,
        })
        .eq('id', body.questId);

      // Award XP
      await this.supabase.from('xp_log').insert({
        user_id: userId,
        amount: quest.xp_reward,
        source: 'quest',
        reason: `Completed: ${quest.title}`,
      });

      // Update level state
      const { data: levelState } = await this.supabase
        .from('level_state')
        .select('xp, level')
        .eq('user_id', userId)
        .single();

      const newXP = (levelState?.xp || 0) + quest.xp_reward;
      const currentLevel = levelState?.level || 1;
      const xpToNext = currentLevel * 1000;
      const levelUp = newXP >= xpToNext;

      await this.supabase
        .from('level_state')
        .update({
          xp: levelUp ? newXP - xpToNext : newXP,
          level: levelUp ? currentLevel + 1 : currentLevel,
        })
        .eq('user_id', userId);

      // Update user stats if stat bonus
      if (quest.stat_bonus) {
        await this.updateStatBonus(userId, quest.stat_bonus);
      }

      // Update total quests completed
      await this.supabase
        .from('user_stats')
        .update({
          total_quests_completed: (await this.getTotalQuests(userId)) + 1,
        })
        .eq('user_id', userId);

      // Check milestones
      const milestoneResults = await this.milestoneTracker.checkMilestones(userId);
      const reachedMilestones = milestoneResults.filter((m) => m.reachedNow);

      return {
        success: true,
        data: {
          quest: {
            ...quest,
            status: 'completed',
            completedAt: new Date(completedAt),
          },
          xpAwarded: quest.xp_reward,
          statBonusApplied: quest.stat_bonus,
          levelUp,
          milestonesReached: reachedMilestones.map((m) => m.milestone),
          systemMessage: levelUp
            ? `◈ [LEVEL UP!] ◈ Hunter, you have ascended to Level ${currentLevel + 1}! ${quest.xp_reward} XP awarded.`
            : `★ [QUEST COMPLETE] ★ ${quest.xp_reward} XP awarded. Continue your progress, Hunter.`,
        },
      };
    } catch (error) {
      this.logger.error('Failed to complete quest:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to complete quest',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get weekly performance review
   * GET /api/v1/ai-coach/weekly-review
   */
  @Get('weekly-review')
  async getWeeklyReview(@Request() req: any): Promise<{
    success: boolean;
    data: any;
    isDue: boolean;
  }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const isDue = this.performanceAnalyzer.isWeeklyReviewDue();
      
      if (isDue) {
        const review = await this.performanceAnalyzer.analyzeWeeklyPerformance(userId);
        return { success: true, data: review, isDue: true };
      }

      const latestReview = await this.performanceAnalyzer.getLatestReview(userId);
      return { success: true, data: latestReview, isDue: false };
    } catch (error) {
      this.logger.error('Failed to get weekly review:', error);
      throw new HttpException(
        'Failed to get weekly review',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Trigger weekly review manually (for testing)
   * POST /api/v1/ai-coach/trigger-review
   */
  @Post('trigger-review')
  async triggerReview(@Request() req: any): Promise<{
    success: boolean;
    data: any;
  }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const review = await this.performanceAnalyzer.analyzeWeeklyPerformance(userId);
      return { success: true, data: review };
    } catch (error) {
      this.logger.error('Failed to trigger review:', error);
      throw new HttpException(
        'Failed to trigger review',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get milestones
   * GET /api/v1/ai-coach/milestones
   */
  @Get('milestones')
  async getMilestones(@Request() req: any): Promise<{
    success: boolean;
    data: {
      milestones: any[];
      nextMilestone: any | null;
    };
  }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const milestones = await this.milestoneTracker.getMilestones(userId);
      const nextMilestone = await this.milestoneTracker.getNextMilestone(userId);

      return {
        success: true,
        data: {
          milestones,
          nextMilestone,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get milestones:', error);
      throw new HttpException(
        'Failed to get milestones',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get AI coach status (comprehensive dashboard data)
   * GET /api/v1/ai-coach/status
   */
  @Get('status')
  async getStatus(@Request() req: any): Promise<{
    success: boolean;
    data: IAICoachStatus;
  }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const goal = await this.goalAnalyzer.getActiveGoal(userId);
      const masterPlan = goal ? await this.goalAnalyzer.getMasterPlan(goal.id) : undefined;
      
      const questsResponse = goal 
        ? await this.questGenerator.getTodaysQuests(userId)
        : { quests: [], canRegenerate: false, regenerationsRemaining: 0 };

      const milestones = await this.milestoneTracker.getMilestones(userId);
      const nextMilestone = await this.milestoneTracker.getNextMilestone(userId);
      const latestReview = await this.performanceAnalyzer.getLatestReview(userId);
      const weeklyReviewDue = this.performanceAnalyzer.isWeeklyReviewDue();

      // Calculate current phase
      let currentPhase;
      if (masterPlan && goal) {
        const daysElapsed = Math.floor(
          (Date.now() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        currentPhase = masterPlan.phases.find(
          (p) => daysElapsed >= p.startDay - 1 && daysElapsed <= p.endDay
        );
      }

      // Calculate overall progress
      let overallProgress = {
        percentage: 0,
        daysElapsed: 0,
        daysRemaining: 0,
        questsCompleted: 0,
        xpEarned: 0,
      };

      if (goal) {
        const daysElapsed = Math.floor(
          (Date.now() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const { count: completedQuests } = await this.supabase
          .from('ai_daily_quests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('goal_id', goal.id)
          .eq('status', 'completed');

        const { data: xpData } = await this.supabase
          .from('xp_log')
          .select('amount')
          .eq('user_id', userId)
          .gte('created_at', goal.startDate.toISOString());

        const totalXP = xpData?.reduce((sum, log) => sum + (log.amount || 0), 0) || 0;

        overallProgress = {
          percentage: Math.min(100, (daysElapsed / goal.timelineDays) * 100),
          daysElapsed,
          daysRemaining: Math.max(0, goal.timelineDays - daysElapsed),
          questsCompleted: completedQuests || 0,
          xpEarned: totalXP,
        };
      }

      return {
        success: true,
        data: {
          hasActiveGoal: !!goal,
          goal: goal || undefined,
          masterPlan,
          todaysQuests: questsResponse.quests,
          currentPhase,
          nextMilestone: nextMilestone || undefined,
          weeklyReviewDue,
          lastWeeklyReview: latestReview || undefined,
          overallProgress,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get status:', error);
      throw new HttpException(
        'Failed to get AI coach status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Admin: Trigger daily quest generation for all users
   * POST /api/v1/ai-coach/admin/generate-all-quests
   */
  @Post('admin/generate-all-quests')
  async adminGenerateAllQuests(): Promise<{
    success: boolean;
    data: any;
  }> {
    // In production, add admin role check
    try {
      const result = await this.questScheduler.generateQuestsForAllUsers();
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        'Failed to generate quests for all users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Admin: Trigger weekly reviews for all users
   * POST /api/v1/ai-coach/admin/generate-all-reviews
   */
  @Post('admin/generate-all-reviews')
  async adminGenerateAllReviews(): Promise<{
    success: boolean;
    data: any;
  }> {
    // In production, add admin role check
    try {
      const result = await this.questScheduler.generateWeeklyReviewsForAllUsers();
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        'Failed to generate reviews for all users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update stat bonus
   */
  private async updateStatBonus(userId: string, stat: string): Promise<void> {
    const statColumn = stat.toLowerCase();
    const validStats = ['strength', 'agility', 'intelligence', 'vitality'];
    
    if (!validStats.includes(statColumn)) return;

    const { data: currentStats } = await this.supabase
      .from('user_stats')
      .select(statColumn)
      .eq('user_id', userId)
      .single();

    if (currentStats) {
      await this.supabase
        .from('user_stats')
        .update({ [statColumn]: (currentStats[statColumn] || 10) + 1 })
        .eq('user_id', userId);
    }
  }

  /**
   * Get total quests completed
   */
  private async getTotalQuests(userId: string): Promise<number> {
    const { data } = await this.supabase
      .from('user_stats')
      .select('total_quests_completed')
      .eq('user_id', userId)
      .single();

    return data?.total_quests_completed || 0;
  }
}
