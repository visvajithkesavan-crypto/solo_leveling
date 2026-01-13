import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { StatusWindow, xpToNextLevel } from '@solo-leveling/shared';

@Injectable()
export class ProgressService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  /**
   * Get status window data for user
   */
  async getStatusWindow(userId: string): Promise<StatusWindow> {
    // Get level state
    const { data: levelState } = await this.supabase
      .from('level_state')
      .select('*')
      .eq('user_id', userId)
      .single();

    const level = levelState?.level || 1;
    const xp = levelState?.xp || 0;

    // Get streak
    const { data: streak } = await this.supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_key', 'daily_verified')
      .single();

    return {
      level,
      xp,
      xpToNext: xpToNextLevel(level),
      streak: streak?.current || 0,
      bestStreak: streak?.best || 0,
    };
  }
}
