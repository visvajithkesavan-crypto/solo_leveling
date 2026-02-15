/**
 * Solo Leveling System - Milestone Tracker Service
 * 
 * Tracks progress toward milestones, triggers celebrations,
 * unlocks shadow soldiers, and awards bonus XP.
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { OpenAIService } from './openai.service';
import { GoalAnalyzerService } from './goal-analyzer.service';
import {
  IMilestoneRecord,
  MilestoneStatus,
} from './interfaces';

interface MilestoneCheckResult {
  milestoneId: string;
  reachedNow: boolean;
  milestone: IMilestoneRecord;
  celebrationMessage?: string;
  shadowUnlocked?: string;
  bonusXpAwarded?: number;
}

@Injectable()
export class MilestoneTrackerService {
  private readonly logger = new Logger(MilestoneTrackerService.name);

  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    private readonly openai: OpenAIService,
    private readonly goalAnalyzer: GoalAnalyzerService,
  ) {}

  /**
   * Check all milestones for a user and process any reached milestones
   */
  async checkMilestones(userId: string): Promise<MilestoneCheckResult[]> {
    this.logger.log(`Checking milestones for user ${userId}`);

    // Get active goal
    const goal = await this.goalAnalyzer.getActiveGoal(userId);
    if (!goal) {
      return [];
    }

    // Get all pending milestones
    const { data: milestones, error } = await this.supabase
      .from('milestone_records')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goal.id)
      .in('status', ['pending', 'in_progress'])
      .order('milestone_index', { ascending: true });

    if (error || !milestones || milestones.length === 0) {
      return [];
    }

    const results: MilestoneCheckResult[] = [];
    const today = new Date();

    for (const milestone of milestones) {
      const targetDate = new Date(milestone.target_date);
      const daysUntilDue = Math.floor(
        (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Check if milestone should be evaluated
      if (daysUntilDue <= 0 || milestone.completion_percentage >= 100) {
        const result = await this.evaluateMilestone(userId, milestone);
        if (result) {
          results.push(result);
        }
      } else if (daysUntilDue <= 3 && milestone.status === 'pending') {
        // Update to in_progress if approaching deadline
        await this.updateMilestoneStatus(milestone.id, 'in_progress');
      }
    }

    return results;
  }

  /**
   * Evaluate if a milestone has been completed
   */
  private async evaluateMilestone(
    userId: string,
    milestone: any,
  ): Promise<MilestoneCheckResult | null> {
    // Calculate completion based on quest performance
    const completionPercentage = await this.calculateMilestoneCompletion(
      userId,
      milestone,
    );

    const wasCompleted = milestone.status === 'completed';
    const isNowCompleted = completionPercentage >= 100;

    if (isNowCompleted && !wasCompleted) {
      // Milestone just completed!
      const celebrationMessage = await this.generateCelebrationMessage(
        milestone.title,
        milestone.milestone_index,
      );

      // Get master plan for shadow rewards
      const masterPlan = await this.goalAnalyzer.getMasterPlan(milestone.goal_id);
      const planMilestone = masterPlan?.milestones.find(
        (m) => m.index === milestone.milestone_index,
      );

      const bonusXp = planMilestone?.reward?.xp || 250;
      const shadowToUnlock = planMilestone?.reward?.shadowUnlock;

      // Update milestone record
      await this.supabase
        .from('milestone_records')
        .update({
          status: 'completed',
          completion_percentage: 100,
          completed_at: new Date().toISOString(),
          celebration_message: celebrationMessage,
          shadow_unlocked: shadowToUnlock || null,
          bonus_xp_awarded: bonusXp,
        })
        .eq('id', milestone.id);

      // Award bonus XP
      await this.awardBonusXP(userId, bonusXp, `Milestone: ${milestone.title}`);

      // Unlock shadow if applicable
      if (shadowToUnlock) {
        await this.unlockShadow(userId, shadowToUnlock);
      }

      return {
        milestoneId: milestone.id,
        reachedNow: true,
        milestone: this.transformMilestone({
          ...milestone,
          status: 'completed',
          completion_percentage: 100,
          celebration_message: celebrationMessage,
          shadow_unlocked: shadowToUnlock,
          bonus_xp_awarded: bonusXp,
        }),
        celebrationMessage,
        shadowUnlocked: shadowToUnlock,
        bonusXpAwarded: bonusXp,
      };
    } else if (!isNowCompleted && new Date(milestone.target_date) < new Date()) {
      // Milestone missed
      await this.supabase
        .from('milestone_records')
        .update({
          status: 'missed',
          completion_percentage: completionPercentage,
        })
        .eq('id', milestone.id);

      return {
        milestoneId: milestone.id,
        reachedNow: false,
        milestone: this.transformMilestone({
          ...milestone,
          status: 'missed',
          completion_percentage: completionPercentage,
        }),
      };
    }

    // Update completion percentage
    if (completionPercentage !== milestone.completion_percentage) {
      await this.supabase
        .from('milestone_records')
        .update({ completion_percentage: completionPercentage })
        .eq('id', milestone.id);
    }

    return null;
  }

  /**
   * Calculate milestone completion percentage based on quest performance
   */
  private async calculateMilestoneCompletion(
    userId: string,
    milestone: any,
  ): Promise<number> {
    const startDate = new Date(milestone.created_at);
    const targetDate = new Date(milestone.target_date);

    // Get quest completion rate for the milestone period
    const { data: questStats } = await this.supabase.rpc('get_weekly_quest_stats', {
      p_user_id: userId,
      p_start_date: startDate.toISOString().split('T')[0],
      p_end_date: targetDate.toISOString().split('T')[0],
    });

    const stats = questStats?.[0];
    if (!stats) {
      return 0;
    }

    // Completion is based on:
    // 1. Quest completion rate (70% weight)
    // 2. Time progress (30% weight)
    const questWeight = 0.7;
    const timeWeight = 0.3;

    const today = new Date();
    const totalDays = Math.max(
      1,
      (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const elapsedDays = Math.max(
      0,
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const timeProgress = Math.min(100, (elapsedDays / totalDays) * 100);

    const completion =
      stats.completion_rate * questWeight + timeProgress * timeWeight;

    return Math.min(100, Math.max(0, completion));
  }

  /**
   * Generate a celebration message for completed milestone
   */
  private async generateCelebrationMessage(
    milestoneTitle: string,
    milestoneIndex: number,
  ): Promise<string> {
    if (!this.openai.isAvailable()) {
      return this.getFallbackCelebration(milestoneIndex);
    }

    const result = await this.openai.createCompletion({
      messages: [
        {
          role: 'system',
          content: `${this.openai.getSystemPersonalityPrompt()}

Generate a CELEBRATION MESSAGE for a Hunter who just completed a milestone.
Keep it to 2-3 dramatic sentences in the System voice.
Use symbols like ◈, ★, ⚔️ for emphasis.`,
        },
        {
          role: 'user',
          content: `The Hunter has completed: "${milestoneTitle}" (Milestone ${milestoneIndex + 1})`,
        },
      ],
      temperature: 0.8,
      maxTokens: 150,
    });

    return result.success && result.content
      ? result.content
      : this.getFallbackCelebration(milestoneIndex);
  }

  /**
   * Get fallback celebration message
   */
  private getFallbackCelebration(milestoneIndex: number): string {
    const celebrations = [
      '◈ [MILESTONE ACHIEVED] ◈ Hunter, you have proven your dedication. Your first milestone falls. The journey truly begins now.',
      '★ [PROGRESS CONFIRMED] ★ Impressive. Another milestone conquered. Your power grows beyond initial expectations. Continue forward.',
      '⚔️ [REMARKABLE ACHIEVEMENT] ⚔️ Few reach this point. You have demonstrated the will of a true Hunter. Greater challenges await.',
      '◈ [FINAL MILESTONE COMPLETE] ◈ You have done what many thought impossible. Your transformation is complete. A new legend rises.',
    ];

    return celebrations[Math.min(milestoneIndex, celebrations.length - 1)];
  }

  /**
   * Award bonus XP for milestone completion
   */
  private async awardBonusXP(
    userId: string,
    amount: number,
    reason: string,
  ): Promise<void> {
    // Log XP award
    await this.supabase.from('xp_log').insert({
      user_id: userId,
      amount,
      source: 'milestone',
      reason,
    });

    // Update level state
    const { data: levelState } = await this.supabase
      .from('level_state')
      .select('xp')
      .eq('user_id', userId)
      .single();

    const newXP = (levelState?.xp || 0) + amount;

    await this.supabase
      .from('level_state')
      .update({ xp: newXP })
      .eq('user_id', userId);

    this.logger.log(`Awarded ${amount} bonus XP to user ${userId} for: ${reason}`);
  }

  /**
   * Unlock a shadow soldier for the user
   */
  private async unlockShadow(userId: string, shadowId: string): Promise<void> {
    const { error } = await this.supabase.from('user_shadows').insert({
      user_id: userId,
      shadow_id: shadowId,
      is_active: false,
    });

    if (error && !error.message.includes('duplicate')) {
      this.logger.error(`Failed to unlock shadow ${shadowId}:`, error);
    } else {
      this.logger.log(`Unlocked shadow ${shadowId} for user ${userId}`);
    }
  }

  /**
   * Update milestone status
   */
  private async updateMilestoneStatus(
    milestoneId: string,
    status: MilestoneStatus,
  ): Promise<void> {
    await this.supabase
      .from('milestone_records')
      .update({ status })
      .eq('id', milestoneId);
  }

  /**
   * Get all milestones for a user's active goal
   */
  async getMilestones(userId: string): Promise<IMilestoneRecord[]> {
    const goal = await this.goalAnalyzer.getActiveGoal(userId);
    if (!goal) {
      return [];
    }

    const { data, error } = await this.supabase
      .from('milestone_records')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goal.id)
      .order('milestone_index', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(this.transformMilestone);
  }

  /**
   * Get the next upcoming milestone
   */
  async getNextMilestone(userId: string): Promise<IMilestoneRecord | null> {
    const milestones = await this.getMilestones(userId);
    return (
      milestones.find((m) => m.status === 'pending' || m.status === 'in_progress') ||
      null
    );
  }

  /**
   * Transform database record to interface type
   */
  private transformMilestone(data: any): IMilestoneRecord {
    return {
      id: data.id,
      userId: data.user_id,
      goalId: data.goal_id,
      planId: data.plan_id,
      milestoneIndex: data.milestone_index,
      title: data.title,
      description: data.description,
      targetDate: new Date(data.target_date),
      status: data.status,
      completionPercentage: data.completion_percentage,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      celebrationMessage: data.celebration_message,
      shadowUnlocked: data.shadow_unlocked,
      bonusXpAwarded: data.bonus_xp_awarded,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
