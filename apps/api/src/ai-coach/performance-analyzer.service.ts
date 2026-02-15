/**
 * Solo Leveling System - Performance Analyzer Service
 * 
 * Analyzes weekly performance and generates AI-powered reviews
 * with verdict, stats, recommendations, and difficulty adjustments.
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { OpenAIService } from './openai.service';
import { GoalAnalyzerService } from './goal-analyzer.service';
import {
  IWeeklyReview,
  IWeeklyStats,
  PerformanceVerdict,
  DifficultyAdjustment,
} from './interfaces';

interface WeeklyReviewAIResponse {
  verdict: PerformanceVerdict;
  systemCommentary: string;
  difficultyAdjustment: DifficultyAdjustment;
  recommendations: string[];
  motivationalMessage: string;
}

@Injectable()
export class PerformanceAnalyzerService {
  private readonly logger = new Logger(PerformanceAnalyzerService.name);

  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    private readonly openai: OpenAIService,
    private readonly goalAnalyzer: GoalAnalyzerService,
  ) {}

  /**
   * Analyze weekly performance and create a review
   */
  async analyzeWeeklyPerformance(userId: string): Promise<IWeeklyReview> {
    this.logger.log(`Analyzing weekly performance for user ${userId}`);

    // Calculate week boundaries
    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // Check if review already exists for this week
    const existingReview = await this.getExistingReview(
      userId,
      weekStart.toISOString().split('T')[0],
    );
    if (existingReview) {
      return existingReview;
    }

    // Get weekly stats
    const stats = await this.getWeeklyStats(
      userId,
      weekStart.toISOString().split('T')[0],
      weekEnd.toISOString().split('T')[0],
    );

    // Get current goal
    const goal = await this.goalAnalyzer.getActiveGoal(userId);

    // Generate AI review
    let aiReview: WeeklyReviewAIResponse;
    if (this.openai.isAvailable()) {
      aiReview = await this.generateAIReview(stats, goal?.goalText);
    } else {
      aiReview = this.generateFallbackReview(stats);
    }

    // Calculate verdict if not provided by AI
    const verdict = aiReview.verdict || this.calculateVerdict(stats.completionRate);

    // Create and save the review
    const review = await this.saveReview(userId, goal?.id, {
      weekStart,
      weekEnd,
      verdict,
      stats,
      aiReview,
    });

    return review;
  }

  /**
   * Get weekly stats for a user
   */
  private async getWeeklyStats(
    userId: string,
    weekStart: string,
    weekEnd: string,
  ): Promise<IWeeklyStats> {
    // Get quest stats
    const { data: questStats } = await this.supabase.rpc('get_weekly_quest_stats', {
      p_user_id: userId,
      p_start_date: weekStart,
      p_end_date: weekEnd,
    });

    const stats = questStats?.[0] || {
      total_quests: 0,
      completed_quests: 0,
      failed_quests: 0,
      skipped_quests: 0,
      completion_rate: 0,
      total_xp_earned: 0,
    };

    // Get streak info
    const { data: streak } = await this.supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .single();

    // Get stats gained this week
    const { data: xpLogs } = await this.supabase
      .from('xp_log')
      .select('amount')
      .eq('user_id', userId)
      .gte('created_at', weekStart)
      .lte('created_at', weekEnd);

    const xpEarned = xpLogs?.reduce((sum, log) => sum + (log.amount || 0), 0) || 0;

    return {
      totalQuests: stats.total_quests,
      completedQuests: stats.completed_quests,
      failedQuests: stats.failed_quests,
      skippedQuests: stats.skipped_quests,
      completionRate: stats.completion_rate,
      xpEarned: xpEarned || stats.total_xp_earned,
      streakMaintained: (streak?.current_streak || 0) >= 7,
      currentStreak: streak?.current_streak || 0,
      statsGained: {
        strength: Math.floor(stats.completed_quests * 0.3),
        agility: Math.floor(stats.completed_quests * 0.3),
        intelligence: Math.floor(stats.completed_quests * 0.2),
        vitality: Math.floor(stats.completed_quests * 0.2),
      },
    };
  }

  /**
   * Generate AI-powered review
   */
  private async generateAIReview(
    stats: IWeeklyStats,
    goalText?: string,
  ): Promise<WeeklyReviewAIResponse> {
    const result = await this.openai.createJsonCompletion<WeeklyReviewAIResponse>({
      messages: [
        {
          role: 'system',
          content: `${this.openai.getSystemPersonalityPrompt()}

You are generating a WEEKLY PERFORMANCE REVIEW for a Hunter.

RETURN JSON with this structure:
{
  "verdict": "excellent|good|adequate|needs_improvement|disappointing",
  "systemCommentary": "2-3 sentences in dramatic System voice analyzing performance",
  "difficultyAdjustment": "increase|decrease|maintain",
  "recommendations": ["3-5 specific actionable recommendations"],
  "motivationalMessage": "Closing message to motivate the Hunter"
}

VERDICT GUIDELINES:
- excellent: 90%+ completion rate, maintained streak
- good: 75-89% completion rate
- adequate: 60-74% completion rate  
- needs_improvement: 40-59% completion rate
- disappointing: Below 40% completion rate

Be encouraging but honest. The System pushes Hunters to grow.`,
        },
        {
          role: 'user',
          content: `
◇ [WEEKLY PERFORMANCE DATA] ◇

HUNTER'S GOAL: ${goalText || 'General self-improvement'}

WEEKLY STATISTICS:
- Total Quests Assigned: ${stats.totalQuests}
- Quests Completed: ${stats.completedQuests}
- Quests Failed: ${stats.failedQuests}
- Quests Skipped: ${stats.skippedQuests}
- Completion Rate: ${stats.completionRate.toFixed(1)}%
- XP Earned: ${stats.xpEarned}
- Current Streak: ${stats.currentStreak} days
- Streak Maintained All Week: ${stats.streakMaintained ? 'Yes' : 'No'}

Generate a comprehensive weekly review for this Hunter.`,
        },
      ],
      temperature: 0.7,
      maxTokens: 800,
    });

    if (!result.success || !result.data) {
      return this.generateFallbackReview(stats);
    }

    return result.data;
  }

  /**
   * Generate fallback review when AI unavailable
   */
  private generateFallbackReview(stats: IWeeklyStats): WeeklyReviewAIResponse {
    const verdict = this.calculateVerdict(stats.completionRate);
    const commentaries: Record<PerformanceVerdict, string> = {
      excellent: `◈ [EXCEPTIONAL PERFORMANCE] ◈ Hunter, you have exceeded expectations. ${stats.completionRate.toFixed(1)}% quest completion demonstrates true dedication. Your power grows substantially.`,
      good: `★ [SATISFACTORY PROGRESS] ★ Hunter, your performance this week was commendable. ${stats.completedQuests} quests completed shows commitment. Continue this trajectory.`,
      adequate: `◇ [ACCEPTABLE EFFORT] ◇ Hunter, you have maintained basic progress. ${stats.completionRate.toFixed(1)}% completion is functional, but greater power awaits those who push harder.`,
      needs_improvement: `⚠️ [WARNING: SUBOPTIMAL PERFORMANCE] ⚠️ Hunter, your completion rate of ${stats.completionRate.toFixed(1)}% falls below acceptable standards. The System demands more.`,
      disappointing: `❌ [CRITICAL FAILURE DETECTED] ❌ Hunter, ${stats.completionRate.toFixed(1)}% completion rate is unacceptable. Without immediate improvement, stagnation is inevitable.`,
    };

    const recommendations: Record<PerformanceVerdict, string[]> = {
      excellent: [
        'Increase difficulty to maintain growth trajectory',
        'Consider adding an extra challenge quest',
        'Share your strategies with the community',
      ],
      good: [
        'Maintain current momentum',
        'Identify and strengthen weak areas',
        'Focus on consistency over intensity',
      ],
      adequate: [
        'Review and simplify your daily routine',
        'Start with easier quests to build momentum',
        'Set specific times for quest completion',
      ],
      needs_improvement: [
        'Reduce quest count to focus on completion',
        'Identify obstacles preventing completion',
        'Create accountability systems',
        'Start with one quest and build up',
      ],
      disappointing: [
        'Reassess your current goal and timeline',
        'Focus on just ONE habit this week',
        'Remove friction from your environment',
        'Consider if external factors need addressing',
        'Reach out for support if needed',
      ],
    };

    return {
      verdict,
      systemCommentary: commentaries[verdict],
      difficultyAdjustment: this.calculateDifficultyAdjustment(stats.completionRate),
      recommendations: recommendations[verdict],
      motivationalMessage: stats.completionRate >= 60
        ? '◇ Continue forward, Hunter. Every quest completed brings you closer to your goal.'
        : '◇ Every Hunter faces setbacks. Rise again. The System awaits your comeback.',
    };
  }

  /**
   * Calculate performance verdict
   */
  private calculateVerdict(completionRate: number): PerformanceVerdict {
    if (completionRate >= 90) return 'excellent';
    if (completionRate >= 75) return 'good';
    if (completionRate >= 60) return 'adequate';
    if (completionRate >= 40) return 'needs_improvement';
    return 'disappointing';
  }

  /**
   * Calculate difficulty adjustment recommendation
   */
  private calculateDifficultyAdjustment(completionRate: number): DifficultyAdjustment {
    if (completionRate >= 90) return 'increase';
    if (completionRate < 50) return 'decrease';
    return 'maintain';
  }

  /**
   * Save review to database
   */
  private async saveReview(
    userId: string,
    goalId: string | undefined,
    data: {
      weekStart: Date;
      weekEnd: Date;
      verdict: PerformanceVerdict;
      stats: IWeeklyStats;
      aiReview: WeeklyReviewAIResponse;
    },
  ): Promise<IWeeklyReview> {
    const { data: review, error } = await this.supabase
      .from('weekly_reviews')
      .insert({
        user_id: userId,
        goal_id: goalId || null,
        week_start: data.weekStart.toISOString().split('T')[0],
        week_end: data.weekEnd.toISOString().split('T')[0],
        verdict: data.verdict,
        completion_rate: data.stats.completionRate,
        total_quests: data.stats.totalQuests,
        completed_quests: data.stats.completedQuests,
        xp_earned: data.stats.xpEarned,
        streak_maintained: data.stats.streakMaintained,
        stats_gained: data.stats.statsGained,
        system_commentary: data.aiReview.systemCommentary,
        difficulty_adjustment: data.aiReview.difficultyAdjustment,
        recommendations: data.aiReview.recommendations,
        raw_ai_response: data.aiReview,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save review: ${error.message}`);
    }

    return this.transformReview(review);
  }

  /**
   * Get existing review for a week
   */
  private async getExistingReview(
    userId: string,
    weekStart: string,
  ): Promise<IWeeklyReview | null> {
    const { data } = await this.supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single();

    return data ? this.transformReview(data) : null;
  }

  /**
   * Get the latest weekly review for a user
   */
  async getLatestReview(userId: string): Promise<IWeeklyReview | null> {
    const { data } = await this.supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('week_end', { ascending: false })
      .limit(1)
      .single();

    return data ? this.transformReview(data) : null;
  }

  /**
   * Check if weekly review is due (Sunday)
   */
  isWeeklyReviewDue(): boolean {
    const today = new Date();
    return today.getDay() === 0; // Sunday
  }

  /**
   * Transform database record to interface type
   */
  private transformReview(data: any): IWeeklyReview {
    return {
      id: data.id,
      userId: data.user_id,
      goalId: data.goal_id,
      weekStart: new Date(data.week_start),
      weekEnd: new Date(data.week_end),
      verdict: data.verdict,
      completionRate: data.completion_rate,
      totalQuests: data.total_quests,
      completedQuests: data.completed_quests,
      xpEarned: data.xp_earned,
      streakMaintained: data.streak_maintained,
      statsGained: data.stats_gained,
      systemCommentary: data.system_commentary,
      achievementsUnlocked: data.achievements_unlocked || [],
      difficultyAdjustment: data.difficulty_adjustment,
      recommendations: data.recommendations,
      createdAt: new Date(data.created_at),
    };
  }
}
