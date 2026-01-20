/**
 * Solo Leveling System - AI Quest Generation Service
 * 
 * Uses OpenAI GPT to generate personalized daily quests
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

interface UserContext {
  userId: string;
  level: number;
  jobClass: string;
  currentStreak: number;
  completedQuestsToday: number;
  recentQuestTypes: string[];
  userGoals: string[];
  stats: {
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
  };
}

interface GeneratedQuest {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  questType: string;
  targetValue: number;
  metricKey: string;
  xpReward: number;
  statBonus?: string;
}

@Injectable()
export class AiQuestService {
  private readonly logger = new Logger(AiQuestService.name);

  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  /**
   * System personality prompt for "The System" voice
   */
  private getSystemPrompt(): string {
    return `You are "The System" from Solo Leveling - a mysterious, powerful, and calculating entity that assigns quests to Hunters.

Your personality:
- Speak in formal, declarative statements
- Use terms like "Hunter", "Player", "Quest", "Failure", "Arise"
- Be encouraging but stern - failure has consequences
- Reference the user's stats, level, and class when appropriate
- Add dramatic flair with symbols like ◇, ◈, ★

Quest Generation Rules:
1. Quests should be REAL, ACHIEVABLE daily tasks
2. Match difficulty to the user's level and recent performance
3. Vary quest types to avoid repetition
4. Include a mix of physical, mental, and wellness quests
5. Higher difficulty = higher XP rewards
6. Consider the user's job class for bonus XP opportunities

XP Guidelines:
- Easy (E-Rank): 20-50 XP
- Medium (D-Rank): 50-100 XP
- Hard (B-Rank): 100-200 XP
- Extreme (S-Rank): 200-500 XP

Quest Types:
- workout: Physical exercises (pushups, squats, running)
- cardio: Running, cycling, swimming
- strength: Weight training, resistance exercises
- study: Reading, learning, courses
- meditation: Mindfulness, breathing exercises
- nutrition: Healthy eating, water intake
- sleep: Sleep quality, bedtime habits
- productivity: Work tasks, project completion
- social: Connecting with others
- creativity: Art, music, writing

Return ONLY valid JSON array of quest objects.`;
  }

  /**
   * Build the user context prompt
   */
  private buildUserContextPrompt(context: UserContext): string {
    return `
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

USER GOALS: ${context.userGoals.join(', ') || 'General self-improvement'}

RECENT QUEST TYPES (avoid repetition): ${context.recentQuestTypes.join(', ') || 'None'}

Generate 3-5 daily quests for this Hunter. Include variety and match their profile.
Consider their lowest stat for improvement opportunities.

Return JSON array format:
[
  {
    "title": "Quest title",
    "description": "Detailed description in System voice",
    "difficulty": "easy|medium|hard|extreme",
    "questType": "workout|cardio|study|etc",
    "targetValue": 100,
    "metricKey": "steps|pushups|minutes|etc",
    "xpReward": 50,
    "statBonus": "strength|agility|intelligence|vitality"
  }
]`;
  }

  /**
   * Generate daily quests for a user using AI
   */
  async generateDailyQuests(userId: string): Promise<GeneratedQuest[]> {
    try {
      // Get user context
      const context = await this.getUserContext(userId);
      
      // Check if OpenAI API key is configured
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        this.logger.warn('OpenAI API key not configured, using fallback quests');
        return this.getFallbackQuests(context);
      }

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: this.getSystemPrompt() },
            { role: 'user', content: this.buildUserContextPrompt(context) },
          ],
          temperature: 0.8,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      const parsed = JSON.parse(content);
      const quests = Array.isArray(parsed) ? parsed : parsed.quests || [];
      
      return quests;
    } catch (error) {
      this.logger.error('Error generating AI quests:', error);
      return this.getFallbackQuests(await this.getUserContext(userId));
    }
  }

  /**
   * Get user context for quest generation
   */
  private async getUserContext(userId: string): Promise<UserContext> {
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

    // Get recent quest types (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: recentQuests } = await this.supabase
      .from('quests')
      .select('metric_key')
      .eq('user_id', userId)
      .gte('created_at', weekAgo.toISOString())
      .limit(20);

    // Get today's completed quests count
    const today = new Date().toISOString().split('T')[0];
    const { count: completedToday } = await this.supabase
      .from('quests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('scheduled_for', today)
      .eq('state', 'passed');

    return {
      userId,
      level: levelState?.level || 1,
      jobClass: userStats?.job_class || 'none',
      currentStreak: streak?.current_streak || 0,
      completedQuestsToday: completedToday || 0,
      recentQuestTypes: recentQuests?.map(q => q.metric_key) || [],
      userGoals: goals?.map(g => g.title) || [],
      stats: {
        strength: userStats?.strength || 10,
        agility: userStats?.agility || 10,
        intelligence: userStats?.intelligence || 10,
        vitality: userStats?.vitality || 10,
      },
    };
  }

  /**
   * Fallback quests when AI is unavailable
   */
  private getFallbackQuests(context: UserContext): GeneratedQuest[] {
    const baseQuests: GeneratedQuest[] = [
      {
        title: 'Morning Movement',
        description: '◇ The Hunter must move to grow stronger. Complete 5,000 steps today.',
        difficulty: 'easy',
        questType: 'cardio',
        targetValue: 5000,
        metricKey: 'steps',
        xpReward: 30,
        statBonus: 'agility',
      },
      {
        title: 'Strength Training',
        description: '◇ Your muscles require tempering. Complete 20 pushups.',
        difficulty: 'medium',
        questType: 'strength',
        targetValue: 20,
        metricKey: 'pushups',
        xpReward: 50,
        statBonus: 'strength',
      },
      {
        title: 'Mental Fortification',
        description: '◇ A Hunter\'s mind must be as sharp as their blade. Read for 15 minutes.',
        difficulty: 'easy',
        questType: 'study',
        targetValue: 15,
        metricKey: 'minutes',
        xpReward: 25,
        statBonus: 'intelligence',
      },
      {
        title: 'Hydration Protocol',
        description: '◇ Optimal performance requires proper hydration. Drink 8 glasses of water.',
        difficulty: 'easy',
        questType: 'nutrition',
        targetValue: 8,
        metricKey: 'glasses',
        xpReward: 20,
        statBonus: 'vitality',
      },
    ];

    // Adjust difficulty based on level
    return baseQuests.map(quest => ({
      ...quest,
      xpReward: Math.floor(quest.xpReward * (1 + context.level * 0.05)),
      targetValue: Math.floor(quest.targetValue * (1 + context.level * 0.02)),
    }));
  }

  /**
   * Save generated quests to database
   */
  async saveGeneratedQuests(userId: string, quests: GeneratedQuest[]): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const questsToInsert = quests.map(quest => ({
      user_id: userId,
      title: quest.title,
      target_value: quest.targetValue,
      metric_key: quest.metricKey,
      scheduled_for: today,
      state: 'assigned',
      kind: 'daily',
    }));

    const { error } = await this.supabase
      .from('quests')
      .insert(questsToInsert);

    if (error) {
      throw new Error(`Failed to save quests: ${error.message}`);
    }
  }
}
