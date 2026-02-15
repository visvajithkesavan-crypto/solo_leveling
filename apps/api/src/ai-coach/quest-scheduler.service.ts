/**
 * Solo Leveling System - Quest Scheduler Service
 * 
 * Handles automated scheduling of daily quest generation
 * and weekly performance reviews using cron jobs.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { QuestGeneratorService } from './quest-generator.service';
import { PerformanceAnalyzerService } from './performance-analyzer.service';
import { MilestoneTrackerService } from './milestone-tracker.service';
import { ICronResult } from './interfaces';

@Injectable()
export class QuestSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(QuestSchedulerService.name);
  private questGenerationInterval: NodeJS.Timeout | null = null;
  private weeklyReviewInterval: NodeJS.Timeout | null = null;

  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    private readonly questGenerator: QuestGeneratorService,
    private readonly performanceAnalyzer: PerformanceAnalyzerService,
    private readonly milestoneTracker: MilestoneTrackerService,
  ) {}

  /**
   * Initialize scheduled jobs on module startup
   */
  async onModuleInit() {
    // In production, use proper cron library like @nestjs/schedule
    // For now, we'll set up interval-based checks
    
    this.logger.log('Quest Scheduler initialized');
    
    // Check every hour if it's time to generate quests
    // In production, replace with proper cron: 0 0 * * * (midnight)
    this.questGenerationInterval = setInterval(() => {
      this.checkAndGenerateDailyQuests();
    }, 60 * 60 * 1000); // Every hour

    // Check every 6 hours for weekly reviews
    // In production, replace with proper cron: 0 10 * * 0 (Sunday 10am)
    this.weeklyReviewInterval = setInterval(() => {
      this.checkAndGenerateWeeklyReviews();
    }, 6 * 60 * 60 * 1000); // Every 6 hours
  }

  /**
   * Manually trigger daily quest generation for all active users
   */
  async generateQuestsForAllUsers(): Promise<ICronResult> {
    this.logger.log('Starting daily quest generation for all users');
    
    const result: ICronResult = {
      success: true,
      processedUsers: 0,
      errors: [],
      timestamp: new Date(),
    };

    try {
      // Get all users with active goals
      const { data: activeUsers, error } = await this.supabase
        .from('user_master_goals')
        .select('user_id')
        .eq('status', 'active');

      if (error) {
        throw new Error(`Failed to fetch active users: ${error.message}`);
      }

      if (!activeUsers || activeUsers.length === 0) {
        this.logger.log('No active users found for quest generation');
        return result;
      }

      const uniqueUserIds = [...new Set(activeUsers.map(u => u.user_id))];
      this.logger.log(`Found ${uniqueUserIds.length} users with active goals`);

      for (const userId of uniqueUserIds) {
        try {
          await this.questGenerator.generateDailyQuests(userId);
          result.processedUsers++;
        } catch (userError) {
          const errorMsg = `User ${userId}: ${userError instanceof Error ? userError.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }

      this.logger.log(`Quest generation complete. Processed: ${result.processedUsers}, Errors: ${result.errors.length}`);
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      this.logger.error('Quest generation failed:', error);
    }

    return result;
  }

  /**
   * Manually trigger weekly reviews for all users
   */
  async generateWeeklyReviewsForAllUsers(): Promise<ICronResult> {
    this.logger.log('Starting weekly review generation for all users');
    
    const result: ICronResult = {
      success: true,
      processedUsers: 0,
      errors: [],
      timestamp: new Date(),
    };

    try {
      // Get all users with any quest history
      const { data: activeUsers, error } = await this.supabase
        .from('ai_daily_quests')
        .select('user_id')
        .limit(1000);

      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      if (!activeUsers || activeUsers.length === 0) {
        this.logger.log('No users found for weekly reviews');
        return result;
      }

      const uniqueUserIds = [...new Set(activeUsers.map(u => u.user_id))];

      for (const userId of uniqueUserIds) {
        try {
          await this.performanceAnalyzer.analyzeWeeklyPerformance(userId);
          result.processedUsers++;
        } catch (userError) {
          const errorMsg = `User ${userId}: ${userError instanceof Error ? userError.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }

      this.logger.log(`Weekly reviews complete. Processed: ${result.processedUsers}, Errors: ${result.errors.length}`);
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      this.logger.error('Weekly review generation failed:', error);
    }

    return result;
  }

  /**
   * Check all users for milestone progress
   */
  async checkMilestonesForAllUsers(): Promise<ICronResult> {
    this.logger.log('Starting milestone check for all users');
    
    const result: ICronResult = {
      success: true,
      processedUsers: 0,
      errors: [],
      timestamp: new Date(),
    };

    try {
      const { data: activeUsers, error } = await this.supabase
        .from('user_master_goals')
        .select('user_id')
        .eq('status', 'active');

      if (error) {
        throw new Error(`Failed to fetch active users: ${error.message}`);
      }

      if (!activeUsers || activeUsers.length === 0) {
        return result;
      }

      const uniqueUserIds = [...new Set(activeUsers.map(u => u.user_id))];

      for (const userId of uniqueUserIds) {
        try {
          await this.milestoneTracker.checkMilestones(userId);
          result.processedUsers++;
        } catch (userError) {
          const errorMsg = `User ${userId}: ${userError instanceof Error ? userError.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Check if it's time to generate daily quests
   */
  private async checkAndGenerateDailyQuests(): Promise<void> {
    const now = new Date();
    const hour = now.getHours();

    // Generate quests between midnight and 1am
    // In production, use proper cron timing
    if (hour === 0) {
      this.logger.log('Midnight detected - triggering daily quest generation');
      await this.generateQuestsForAllUsers();
      await this.checkMilestonesForAllUsers();
    }
  }

  /**
   * Check if it's time for weekly reviews
   */
  private async checkAndGenerateWeeklyReviews(): Promise<void> {
    const now = new Date();
    
    // Sunday morning check
    if (now.getDay() === 0 && now.getHours() >= 9 && now.getHours() <= 11) {
      this.logger.log('Sunday morning detected - triggering weekly reviews');
      await this.generateWeeklyReviewsForAllUsers();
    }
  }

  /**
   * Clean up intervals on module destroy
   */
  onModuleDestroy() {
    if (this.questGenerationInterval) {
      clearInterval(this.questGenerationInterval);
    }
    if (this.weeklyReviewInterval) {
      clearInterval(this.weeklyReviewInterval);
    }
  }
}
