import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DailyHealthSummaryDto } from './dto/daily-health-summary.dto';
import { ManualStepsDto } from './dto/manual-steps.dto';

@Injectable()
export class IngestService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  /**
   * Ingest daily health summary from Health Connect
   * Creates/updates a VERIFIED attempt for today's steps quest
   */
  async ingestDailySummary(
    userId: string,
    dto: DailyHealthSummaryDto,
  ): Promise<{ success: boolean; message: string }> {
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dto.day)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    // Find or create today's steps quest
    let { data: quest, error: questError } = await this.supabase
      .from('quests')
      .select('id')
      .eq('user_id', userId)
      .eq('scheduled_for', dto.day)
      .eq('metric_key', 'steps')
      .single();

    if (questError && questError.code !== 'PGRST116') {
      // PGRST116 = not found (acceptable)
      throw new Error(`Failed to fetch quest: ${questError.message}`);
    }

    let questId: string;

    if (!quest) {
      // Create a steps quest for this day
      const { data: newQuest, error: createError } = await this.supabase
        .from('quests')
        .insert({
          user_id: userId,
          title: `Daily Steps - ${dto.day}`,
          kind: 'daily',
          metric_key: 'steps',
          target_value: 6000, // Default target
          scheduled_for: dto.day,
          state: 'assigned',
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create quest: ${createError.message}`);
      }

      questId = newQuest.id;
    } else {
      questId = quest.id;
    }

    // Check if a verified attempt already exists for this day
    const { data: existingAttempts } = await this.supabase
      .from('quest_attempts')
      .select('id, observed_value')
      .eq('quest_id', questId)
      .eq('source', 'health_connect')
      .eq('verified', true);

    if (existingAttempts && existingAttempts.length > 0) {
      // Update existing attempt
      const { error: updateError } = await this.supabase
        .from('quest_attempts')
        .update({
          observed_value: dto.steps,
          attempted_at: dto.computedAt,
        })
        .eq('id', existingAttempts[0].id);

      if (updateError) {
        throw new Error(`Failed to update attempt: ${updateError.message}`);
      }

      return {
        success: true,
        message: `Updated verified attempt: ${dto.steps} steps`,
      };
    } else {
      // Create new verified attempt
      const { error: insertError } = await this.supabase
        .from('quest_attempts')
        .insert({
          user_id: userId,
          quest_id: questId,
          source: 'health_connect',
          verified: true, // ← KEY: This is a verified attempt
          observed_value: dto.steps,
          attempted_at: dto.computedAt,
        });

      if (insertError) {
        throw new Error(`Failed to create attempt: ${insertError.message}`);
      }

      return {
        success: true,
        message: `Created verified attempt: ${dto.steps} steps`,
      };
    }
  }

  /**
   * Log manual steps from web interface
   * Creates an UNVERIFIED attempt for today's steps quest
   */
  async logManualSteps(
    userId: string,
    dto: ManualStepsDto,
  ): Promise<{ success: boolean; message: string }> {
    const day = dto.day || new Date().toISOString().split('T')[0];

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    // Find or create today's steps quest
    let { data: quest, error: questError } = await this.supabase
      .from('quests')
      .select('id')
      .eq('user_id', userId)
      .eq('scheduled_for', day)
      .eq('metric_key', 'steps')
      .single();

    if (questError && questError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch quest: ${questError.message}`);
    }

    let questId: string;

    if (!quest) {
      // Create a steps quest for this day
      const { data: newQuest, error: createError } = await this.supabase
        .from('quests')
        .insert({
          user_id: userId,
          title: `Daily Steps - ${day}`,
          kind: 'daily',
          metric_key: 'steps',
          target_value: 6000, // Default target
          scheduled_for: day,
          state: 'assigned',
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create quest: ${createError.message}`);
      }

      questId = newQuest.id;
    } else {
      questId = quest.id;
    }

    // Create new unverified attempt (manual entry)
    const { error: insertError } = await this.supabase
      .from('quest_attempts')
      .insert({
        user_id: userId,
        quest_id: questId,
        source: 'manual',
        verified: false, // Manual entries are unverified
        observed_value: dto.steps,
        attempted_at: new Date().toISOString(),
      });

    if (insertError) {
      throw new Error(`Failed to log steps: ${insertError.message}`);
    }

    return {
      success: true,
      message: `Logged ${dto.steps} steps (unverified)`,
    };
  }
}
