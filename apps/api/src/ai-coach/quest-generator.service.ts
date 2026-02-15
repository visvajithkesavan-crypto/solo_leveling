/**
 * Solo Leveling System - Quest Generator Service
 * 
 * Generates personalized daily quests based on user's master plan,
 * current phase, recent performance, and preferences.
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { OpenAIService } from './openai.service';
import { GoalAnalyzerService } from './goal-analyzer.service';
import {
  IAIDailyQuest,
  IGeneratedQuest,
  IUserContext,
  IMasterPlan,
  IPhase,
  IGetDailyQuestsResponse,
} from './interfaces';

@Injectable()
export class QuestGeneratorService {
  private readonly logger = new Logger(QuestGeneratorService.name);
  private readonly maxRegenerationsPerDay: number;

  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    private readonly openai: OpenAIService,
    private readonly goalAnalyzer: GoalAnalyzerService,
  ) {
    this.maxRegenerationsPerDay = parseInt(
      process.env.MAX_QUEST_REGENERATIONS_PER_DAY || '3',
      10,
    );
  }

  /**
   * Generate daily quests for a user
   */
  async generateDailyQuests(userId: string): Promise<IGetDailyQuestsResponse> {
    this.logger.log(`Generating daily quests for user ${userId}`);

    // Get user context
    const context = await this.getUserContext(userId);
    
    // Get active goal and plan
    const goal = await this.goalAnalyzer.getActiveGoal(userId);
    const masterPlan = goal ? await this.goalAnalyzer.getMasterPlan(goal.id) : null;

    // Determine current phase
    const currentPhase = masterPlan ? this.getCurrentPhase(
      masterPlan,
      goal?.startDate || new Date(),
    ) : null;

    // Delete existing pending quests for today (regeneration case)
    const today = new Date().toISOString().split('T')[0];
    await this.supabase
      .from('ai_daily_quests')
      .delete()
      .eq('user_id', userId)
      .eq('scheduled_for', today)
      .eq('status', 'pending');

    // Generate quests
    let quests: IGeneratedQuest[];
    if (this.openai.isAvailable() && masterPlan) {
      quests = await this.generateAIQuests(context, masterPlan, currentPhase);
    } else if (masterPlan) {
      quests = this.generateQuestsFromPlan(masterPlan, currentPhase, context);
    } else {
      quests = this.generateFallbackQuests(context);
    }

    // Save quests to database
    const savedQuests = await this.saveQuests(userId, goal?.id, quests, currentPhase?.number);

    // Get regeneration status
    const { data: regenData } = await this.supabase.rpc('check_regeneration_limit', {
      p_user_id: userId,
      p_max_regenerations: this.maxRegenerationsPerDay,
    });

    const regenStatus = regenData?.[0] || {
      can_regenerate: true,
      regenerations_today: 0,
      remaining: this.maxRegenerationsPerDay,
    };

    // Calculate goal progress
    let goalProgress;
    if (goal) {
      const daysElapsed = Math.floor(
        (Date.now() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24),
      );
      goalProgress = {
        percentage: Math.min(100, (daysElapsed / goal.timelineDays) * 100),
        daysElapsed,
        daysRemaining: goal.timelineDays - daysElapsed,
        currentPhase: currentPhase?.name || 'Phase 1',
      };
    }

    return {
      quests: savedQuests,
      canRegenerate: regenStatus.can_regenerate,
      regenerationsRemaining: regenStatus.remaining,
      goalProgress,
    };
  }

  /**
   * Regenerate quests for today
   */
  async regenerateQuests(userId: string, reason?: string): Promise<IGetDailyQuestsResponse> {
    // Check regeneration limit
    const { data: regenData } = await this.supabase.rpc('check_regeneration_limit', {
      p_user_id: userId,
      p_max_regenerations: this.maxRegenerationsPerDay,
    });

    const regenStatus = regenData?.[0];
    if (!regenStatus?.can_regenerate) {
      throw new Error(
        `Daily regeneration limit reached (${this.maxRegenerationsPerDay}). Try again tomorrow.`,
      );
    }

    // Increment regeneration count
    await this.supabase.rpc('increment_regeneration_count', { p_user_id: userId });

    // Generate new quests
    this.logger.log(`Regenerating quests for user ${userId}. Reason: ${reason || 'Not specified'}`);
    return this.generateDailyQuests(userId);
  }

  /**
   * Get today's quests for a user
   */
  async getTodaysQuests(userId: string): Promise<IGetDailyQuestsResponse> {
    const today = new Date().toISOString().split('T')[0];

    const { data: quests, error } = await this.supabase
      .from('ai_daily_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('scheduled_for', today)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch quests: ${error.message}`);
    }

    // If no quests exist for today, generate them
    if (!quests || quests.length === 0) {
      return this.generateDailyQuests(userId);
    }

    // Get regeneration status
    const { data: regenData } = await this.supabase.rpc('check_regeneration_limit', {
      p_user_id: userId,
      p_max_regenerations: this.maxRegenerationsPerDay,
    });

    const regenStatus = regenData?.[0] || {
      can_regenerate: true,
      remaining: this.maxRegenerationsPerDay,
    };

    // Get goal progress
    const goal = await this.goalAnalyzer.getActiveGoal(userId);
    const masterPlan = goal ? await this.goalAnalyzer.getMasterPlan(goal.id) : null;
    const currentPhase = masterPlan
      ? this.getCurrentPhase(masterPlan, goal?.startDate || new Date())
      : null;

    let goalProgress;
    if (goal) {
      const daysElapsed = Math.floor(
        (Date.now() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24),
      );
      goalProgress = {
        percentage: Math.min(100, (daysElapsed / goal.timelineDays) * 100),
        daysElapsed,
        daysRemaining: goal.timelineDays - daysElapsed,
        currentPhase: currentPhase?.name || 'Phase 1',
      };
    }

    return {
      quests: this.transformQuests(quests),
      canRegenerate: regenStatus.can_regenerate,
      regenerationsRemaining: regenStatus.remaining,
      goalProgress,
    };
  }

  /**
   * Generate quests using AI
   */
  private async generateAIQuests(
    context: IUserContext,
    masterPlan: IMasterPlan,
    currentPhase: IPhase | null,
  ): Promise<IGeneratedQuest[]> {
    const prompt = this.buildQuestGenerationPrompt(context, masterPlan, currentPhase);

    const result = await this.openai.createJsonCompletion<{ quests: IGeneratedQuest[] }>({
      messages: [
        {
          role: 'system',
          content: `${this.openai.getSystemPersonalityPrompt()}

You are generating DAILY QUESTS for a Hunter based on their Master Plan.

RETURN JSON with this structure:
{
  "quests": [
    {
      "title": "Quest Title (short, action-oriented)",
      "description": "System-style description with ◇ symbols",
      "difficulty": "easy|medium|hard|extreme",
      "questType": "physical|mental|productivity|wellness|social|creativity",
      "targetValue": 30,
      "metricKey": "minutes|steps|reps|items|pages|etc",
      "xpReward": 50,
      "statBonus": "strength|agility|intelligence|vitality|null",
      "aiReasoning": "Brief explanation of why this quest was chosen"
    }
  ]
}

QUEST GENERATION RULES:
1. Generate 3-5 quests that align with current phase goals
2. Include at least one habit from the Master Plan
3. Vary quest types - don't repeat the same type twice
4. Match difficulty to user's level and recent performance
5. All descriptions in dramatic System voice
6. Consider user's lowest stat for improvement opportunities

XP GUIDELINES:
- Easy (E-Rank): 20-40 XP
- Medium (D-Rank): 40-80 XP  
- Hard (B-Rank): 80-150 XP
- Extreme (S-Rank): 150-300 XP`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      maxTokens: 1500,
    });

    if (!result.success || !result.data?.quests) {
      this.logger.warn('AI quest generation failed, using plan-based fallback');
      return this.generateQuestsFromPlan(masterPlan, currentPhase, context);
    }

    return result.data.quests;
  }

  /**
   * Build the prompt for quest generation
   */
  private buildQuestGenerationPrompt(
    context: IUserContext,
    masterPlan: IMasterPlan,
    currentPhase: IPhase | null,
  ): string {
    const phaseInfo = currentPhase
      ? `
CURRENT PHASE: ${currentPhase.name} (Phase ${currentPhase.number})
Phase Focus: ${currentPhase.focus.join(', ')}
Phase Habits: ${currentPhase.habits.join(', ')}`
      : '';

    const performanceInfo = context.recentPerformance
      ? `
RECENT PERFORMANCE:
- Last week completion rate: ${context.recentPerformance.lastWeekCompletionRate.toFixed(1)}%
- Average difficulty: ${context.recentPerformance.averageDifficulty}
- Preferred quest types: ${context.recentPerformance.preferredQuestTypes.join(', ')}`
      : '';

    return `
◇ [QUEST GENERATION REQUEST] ◇

HUNTER PROFILE:
- Level: ${context.level}
- Class: ${context.jobClass || 'Unawakened'}
- Current Streak: ${context.currentStreak} days
- Quests Completed Today: ${context.completedQuestsToday}

STATS:
- Strength: ${context.stats.strength}
- Agility: ${context.stats.agility}
- Intelligence: ${context.stats.intelligence}
- Vitality: ${context.stats.vitality}

MASTER GOAL: ${context.masterGoal?.goalText || 'General self-improvement'}
Goal Progress: Day ${context.masterGoal?.daysElapsed || 0} of ${context.masterGoal?.daysRemaining ? context.masterGoal.daysElapsed + context.masterGoal.daysRemaining : 90}
${phaseInfo}

DAILY HABITS FROM PLAN:
${masterPlan.dailyHabits.map((h) => `- ${h.title}: ${h.description}`).join('\n')}
${performanceInfo}

RECENT QUEST TYPES (avoid repetition): ${context.recentQuestTypes.join(', ') || 'None'}

Generate 3-5 daily quests for this Hunter. Include variety and match their profile.
Prioritize habits from the current phase while maintaining balance.`;
  }

  /**
   * Generate quests from master plan (when AI unavailable)
   */
  private generateQuestsFromPlan(
    masterPlan: IMasterPlan,
    currentPhase: IPhase | null,
    context: IUserContext,
  ): IGeneratedQuest[] {
    const quests: IGeneratedQuest[] = [];

    // Add 2-3 habits from the plan
    const shuffledHabits = [...masterPlan.dailyHabits].sort(() => Math.random() - 0.5);
    const habitsToAdd = shuffledHabits.slice(0, 3);

    for (const habit of habitsToAdd) {
      quests.push({
        title: habit.title,
        description: habit.description,
        difficulty: habit.difficulty,
        questType: habit.category,
        targetValue: habit.targetValue || 1,
        metricKey: habit.metricKey || 'completion',
        xpReward: Math.floor(habit.xpReward * (1 + context.level * 0.05)),
        statBonus: habit.statBonus,
        phaseNumber: currentPhase?.number,
      });
    }

    // Add 1-2 generic quests based on lowest stat
    const stats = context.stats;
    const lowestStat = Object.entries(stats).reduce((a, b) =>
      a[1] < b[1] ? a : b,
    );

    const statQuests: Record<string, IGeneratedQuest> = {
      strength: {
        title: 'Strength Training',
        description: '◇ Your physical power requires development. Complete strength exercises.',
        difficulty: 'medium',
        questType: 'physical',
        targetValue: 20,
        metricKey: 'reps',
        xpReward: 60,
        statBonus: 'strength',
      },
      agility: {
        title: 'Speed Protocol',
        description: '◇ Agility determines survival. Complete cardio training.',
        difficulty: 'medium',
        questType: 'physical',
        targetValue: 5000,
        metricKey: 'steps',
        xpReward: 50,
        statBonus: 'agility',
      },
      intelligence: {
        title: 'Mental Cultivation',
        description: '◇ Knowledge is power. Dedicate time to learning.',
        difficulty: 'medium',
        questType: 'mental',
        targetValue: 30,
        metricKey: 'minutes',
        xpReward: 55,
        statBonus: 'intelligence',
      },
      vitality: {
        title: 'Recovery Enhancement',
        description: '◇ Rest and nutrition fuel progress. Focus on wellness.',
        difficulty: 'easy',
        questType: 'wellness',
        targetValue: 8,
        metricKey: 'glasses',
        xpReward: 30,
        statBonus: 'vitality',
      },
    };

    if (statQuests[lowestStat[0]] && quests.length < 5) {
      quests.push(statQuests[lowestStat[0]]);
    }

    return quests;
  }

  /**
   * Generate fallback quests (no goal set)
   */
  private generateFallbackQuests(context: IUserContext): IGeneratedQuest[] {
    return [
      {
        title: 'Morning Activation',
        description: '◇ Begin the day with purpose. Complete 5,000 steps.',
        difficulty: 'easy',
        questType: 'physical',
        targetValue: 5000,
        metricKey: 'steps',
        xpReward: Math.floor(35 * (1 + context.level * 0.05)),
        statBonus: 'agility',
      },
      {
        title: 'Skill Development',
        description: '◇ Invest in your future. Learn for 20 minutes.',
        difficulty: 'medium',
        questType: 'mental',
        targetValue: 20,
        metricKey: 'minutes',
        xpReward: Math.floor(50 * (1 + context.level * 0.05)),
        statBonus: 'intelligence',
      },
      {
        title: 'Physical Training',
        description: '◇ Strengthen your vessel. Complete a workout.',
        difficulty: 'medium',
        questType: 'physical',
        targetValue: 30,
        metricKey: 'minutes',
        xpReward: Math.floor(60 * (1 + context.level * 0.05)),
        statBonus: 'strength',
      },
      {
        title: 'Hydration Protocol',
        description: '◇ Optimal performance requires proper hydration.',
        difficulty: 'easy',
        questType: 'wellness',
        targetValue: 8,
        metricKey: 'glasses',
        xpReward: Math.floor(25 * (1 + context.level * 0.05)),
        statBonus: 'vitality',
      },
    ];
  }

  /**
   * Save quests to database
   */
  private async saveQuests(
    userId: string,
    goalId: string | undefined,
    quests: IGeneratedQuest[],
    phaseNumber?: number,
  ): Promise<IAIDailyQuest[]> {
    const today = new Date().toISOString().split('T')[0];

    const questsToInsert = quests.map((quest) => ({
      user_id: userId,
      goal_id: goalId || null,
      title: quest.title,
      description: quest.description,
      difficulty: quest.difficulty,
      quest_type: quest.questType,
      target_value: quest.targetValue,
      current_value: 0,
      metric_key: quest.metricKey,
      xp_reward: quest.xpReward,
      stat_bonus: quest.statBonus || null,
      scheduled_for: today,
      status: 'pending',
      ai_reasoning: quest.aiReasoning || null,
      phase_number: phaseNumber || quest.phaseNumber || null,
    }));

    const { data, error } = await this.supabase
      .from('ai_daily_quests')
      .insert(questsToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to save quests: ${error.message}`);
    }

    return this.transformQuests(data);
  }

  /**
   * Transform database records to interface type
   */
  private transformQuests(data: any[]): IAIDailyQuest[] {
    return data.map((q) => ({
      id: q.id,
      userId: q.user_id,
      goalId: q.goal_id,
      title: q.title,
      description: q.description,
      difficulty: q.difficulty,
      questType: q.quest_type,
      targetValue: q.target_value,
      currentValue: q.current_value,
      metricKey: q.metric_key,
      xpReward: q.xp_reward,
      statBonus: q.stat_bonus,
      scheduledFor: new Date(q.scheduled_for),
      status: q.status,
      completedAt: q.completed_at ? new Date(q.completed_at) : undefined,
      aiReasoning: q.ai_reasoning,
      regenerationCount: q.regeneration_count,
      phaseNumber: q.phase_number,
      createdAt: new Date(q.created_at),
      updatedAt: new Date(q.updated_at),
    }));
  }

  /**
   * Get current phase based on start date
   */
  private getCurrentPhase(masterPlan: IMasterPlan, startDate: Date): IPhase | null {
    const daysElapsed = Math.floor(
      (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
    );

    for (const phase of masterPlan.phases) {
      if (daysElapsed >= phase.startDay - 1 && daysElapsed <= phase.endDay) {
        return phase;
      }
    }

    // Return last phase if past all phases
    return masterPlan.phases[masterPlan.phases.length - 1] || null;
  }

  /**
   * Get full user context for AI
   */
  private async getUserContext(userId: string): Promise<IUserContext> {
    // Get level state
    const { data: levelState } = await this.supabase
      .from('level_state')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get user stats
    const { data: userStats } = await this.supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get current streak
    const { data: streak } = await this.supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get user's goals
    const { data: goals } = await this.supabase
      .from('goals')
      .select('title')
      .eq('user_id', userId)
      .limit(5);

    // Get recent quest types
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: recentQuests } = await this.supabase
      .from('ai_daily_quests')
      .select('quest_type, difficulty, status')
      .eq('user_id', userId)
      .gte('created_at', weekAgo.toISOString())
      .limit(30);

    // Get today's completed quests count
    const today = new Date().toISOString().split('T')[0];
    const { count: completedToday } = await this.supabase
      .from('ai_daily_quests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('scheduled_for', today)
      .eq('status', 'completed');

    // Get master goal context
    const masterGoal = await this.goalAnalyzer.getActiveGoal(userId);
    let masterGoalContext;
    if (masterGoal) {
      const daysElapsed = Math.floor(
        (Date.now() - new Date(masterGoal.startDate).getTime()) / (1000 * 60 * 60 * 24),
      );
      const masterPlan = await this.goalAnalyzer.getMasterPlan(masterGoal.id);
      const currentPhase = masterPlan
        ? this.getCurrentPhase(masterPlan, masterGoal.startDate)
        : null;

      masterGoalContext = {
        goalText: masterGoal.goalText,
        daysElapsed,
        daysRemaining: masterGoal.timelineDays - daysElapsed,
        currentPhase: currentPhase?.number || 1,
        progressPercentage: (daysElapsed / masterGoal.timelineDays) * 100,
      };
    }

    // Calculate recent performance
    let recentPerformance;
    if (recentQuests && recentQuests.length > 0) {
      const completed = recentQuests.filter((q) => q.status === 'completed').length;
      const completionRate = (completed / recentQuests.length) * 100;
      const questTypes = recentQuests.map((q) => q.quest_type);
      const typeCounts = questTypes.reduce(
        (acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
      const preferredTypes = Object.entries(typeCounts)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 3)
        .map(([type]) => type);

      recentPerformance = {
        lastWeekCompletionRate: completionRate,
        averageDifficulty: 'medium',
        preferredQuestTypes: preferredTypes,
      };
    }

    return {
      userId,
      level: levelState?.level || 1,
      jobClass: userStats?.job_class || 'none',
      currentStreak: streak?.current_streak || 0,
      bestStreak: streak?.best_streak || 0,
      completedQuestsToday: completedToday || 0,
      totalQuestsCompleted: userStats?.total_quests_completed || 0,
      recentQuestTypes: recentQuests?.map((q) => q.quest_type) || [],
      userGoals: goals?.map((g) => g.title) || [],
      stats: {
        strength: userStats?.strength || 10,
        agility: userStats?.agility || 10,
        intelligence: userStats?.intelligence || 10,
        vitality: userStats?.vitality || 10,
      },
      masterGoal: masterGoalContext,
      recentPerformance,
    };
  }
}
