import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Quest,
  QuestAttempt,
  QuestState,
  AttemptResult,
  LevelState,
  Streak,
  EvaluationResponse,
  QuestResult,
  PopupEvent,
  PopupEventType,
  XPSource,
  calculateQuestXp,
  applyXp,
  xpToNextLevel,
} from '@solo-leveling/shared';

@Injectable()
export class EngineService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  /**
   * Evaluate all quests for a specific day
   * Process attempts, calculate XP, update levels, manage streaks
   */
  async evaluateDay(userId: string, day: string): Promise<EvaluationResponse> {
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    // Fetch all quests for the day
    const { data: quests, error: questsError } = await this.supabase
      .from('quests')
      .select('*')
      .eq('user_id', userId)
      .eq('scheduled_for', day);

    if (questsError) {
      throw new Error(`Failed to fetch quests: ${questsError.message}`);
    }

    if (!quests || quests.length === 0) {
      return {
        statusWindow: await this.getStatusWindow(userId),
        questResults: [],
        popupEvents: [{
          type: PopupEventType.QUEST_FAILED,
          title: 'No Quests',
          message: 'No quests scheduled for this day',
        }],
      };
    }

    // Get current streak
    const currentStreak = await this.getCurrentStreak(userId);

    const questResults: QuestResult[] = [];
    const popupEvents: PopupEvent[] = [];
    let totalXpGained = 0;
    let allQuestsPassed = true;
    let allQuestsVerified = true;

    // Evaluate each quest
    for (const quest of quests) {
      const result = await this.evaluateQuest(userId, quest, day, currentStreak);
      questResults.push(result);

      if (result.state === QuestState.PASSED) {
        totalXpGained += result.xp_earned;
        popupEvents.push({
          type: PopupEventType.QUEST_COMPLETED,
          title: 'Quest Completed!',
          message: `"${result.title}" +${result.xp_earned} XP`,
          data: { questId: result.quest_id, xp: result.xp_earned },
        });
      } else {
        allQuestsPassed = false;
        popupEvents.push({
          type: PopupEventType.QUEST_FAILED,
          title: 'Quest Failed',
          message: `"${result.title}" - Better luck next time`,
          data: { questId: result.quest_id },
        });
      }

      // Check if any quest was unverified
      const { data: attempt } = await this.supabase
        .from('quest_attempts')
        .select('verified')
        .eq('quest_id', quest.id)
        .order('attempted_at', { ascending: false })
        .limit(1)
        .single();

      if (attempt && !attempt.verified) {
        allQuestsVerified = false;
      }
    }

    // Apply XP and level up
    const levelUpEvents = await this.applyXpAndLevelUp(userId, totalXpGained);
    popupEvents.push(...levelUpEvents);

    // Update streaks
    await this.updateStreaks(userId, allQuestsPassed && allQuestsVerified);

    // Get updated status window
    const statusWindow = await this.getStatusWindow(userId);

    return {
      statusWindow,
      questResults,
      popupEvents,
    };
  }

  /**
   * Evaluate a single quest
   */
  private async evaluateQuest(
    userId: string,
    quest: Quest,
    day: string,
    currentStreak: number,
  ): Promise<QuestResult> {
    // Find latest attempt for this quest on this day
    const dayStart = `${day}T00:00:00Z`;
    const dayEnd = `${day}T23:59:59Z`;

    const { data: attempts, error: attemptsError } = await this.supabase
      .from('quest_attempts')
      .select('*')
      .eq('quest_id', quest.id)
      .gte('attempted_at', dayStart)
      .lte('attempted_at', dayEnd)
      .order('attempted_at', { ascending: false })
      .limit(1);

    if (attemptsError) {
      throw new Error(`Failed to fetch attempts: ${attemptsError.message}`);
    }

    let state: QuestState;
    let result: AttemptResult | null = null;
    let xpEarned = 0;

    if (!attempts || attempts.length === 0) {
      // No attempt = automatic fail
      state = QuestState.FAILED;
    } else {
      const attempt = attempts[0] as QuestAttempt;
      
      // Determine pass/fail
      if (attempt.observed_value >= quest.target_value) {
        state = QuestState.PASSED;
        result = AttemptResult.PASS;
        
        // Calculate XP
        xpEarned = calculateQuestXp({
          verified: attempt.verified,
          currentStreak,
        });

        // Record XP in ledger
        await this.supabase.from('xp_ledger').insert({
          user_id: userId,
          source: XPSource.QUEST,
          amount: xpEarned,
          quest_id: quest.id,
        });
      } else {
        state = QuestState.FAILED;
        result = AttemptResult.FAIL;
      }

      // Update attempt result
      await this.supabase
        .from('quest_attempts')
        .update({ result })
        .eq('id', attempt.id);
    }

    // Update quest state
    await this.supabase
      .from('quests')
      .update({ state })
      .eq('id', quest.id);

    return {
      quest_id: quest.id,
      title: quest.title,
      state,
      xp_earned: xpEarned,
    };
  }

  /**
   * Apply XP gain and handle level-ups
   */
  private async applyXpAndLevelUp(
    userId: string,
    xpGained: number,
  ): Promise<PopupEvent[]> {
    const popupEvents: PopupEvent[] = [];

    if (xpGained === 0) {
      return popupEvents;
    }

    // Get or create level state
    let { data: levelState, error } = await this.supabase
      .from('level_state')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !levelState) {
      // Create initial level state
      const { data: newState, error: insertError } = await this.supabase
        .from('level_state')
        .insert({
          user_id: userId,
          level: 1,
          xp: 0,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create level state: ${insertError.message}`);
      }

      levelState = newState;
    }

    // Apply XP and calculate level-ups
    const result = applyXp(levelState.level, levelState.xp, xpGained);

    // Update level state
    await this.supabase
      .from('level_state')
      .update({
        level: result.level,
        xp: result.xp,
      })
      .eq('user_id', userId);

    // Create level-up events
    if (result.levelsGained > 0) {
      for (let i = 0; i < result.levelsGained; i++) {
        const newLevel = levelState.level + i + 1;
        popupEvents.push({
          type: PopupEventType.LEVEL_UP,
          title: '⚡ LEVEL UP! ⚡',
          message: `You've reached Level ${newLevel}!`,
          data: { newLevel, xpGained },
        });
      }
    }

    return popupEvents;
  }

  /**
   * Update user streaks
   */
  private async updateStreaks(
    userId: string,
    allVerifiedPassed: boolean,
  ): Promise<void> {
    const streakKey = 'daily_verified';

    // Get current streak
    let { data: streak } = await this.supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_key', streakKey)
      .single();

    if (!streak) {
      // Create initial streak
      await this.supabase.from('streaks').insert({
        user_id: userId,
        streak_key: streakKey,
        current: allVerifiedPassed ? 1 : 0,
        best: allVerifiedPassed ? 1 : 0,
      });
      return;
    }

    if (allVerifiedPassed) {
      // Increment streak
      const newCurrent = streak.current + 1;
      const newBest = Math.max(newCurrent, streak.best);

      await this.supabase
        .from('streaks')
        .update({
          current: newCurrent,
          best: newBest,
        })
        .eq('user_id', userId)
        .eq('streak_key', streakKey);
    } else {
      // Break streak (but keep best)
      await this.supabase
        .from('streaks')
        .update({
          current: 0,
        })
        .eq('user_id', userId)
        .eq('streak_key', streakKey);
    }
  }

  /**
   * Get current streak count
   */
  private async getCurrentStreak(userId: string): Promise<number> {
    const { data: streak } = await this.supabase
      .from('streaks')
      .select('current')
      .eq('user_id', userId)
      .eq('streak_key', 'daily_verified')
      .single();

    return streak?.current || 0;
  }

  /**
   * Get status window data
   */
  async getStatusWindow(userId: string): Promise<any> {
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
