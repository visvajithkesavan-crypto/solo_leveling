/**
 * Solo Leveling System - Goal Analyzer Service
 * 
 * Analyzes user goals using GPT-4 and generates comprehensive master plans
 * with phases, milestones, daily habits, and success metrics.
 * 
 * Now integrates with HonestRankingService for brutally honest assessments.
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { OpenAIService } from './openai.service';
import { HonestRankingService, HunterRank } from './honest-ranking.service';
import {
  IMasterGoal,
  IMasterPlan,
  IPhase,
  IDailyHabit,
  ISuccessMetric,
  IMilestone,
  IGoalAnalysis,
  ISetGoalResponse,
} from './interfaces';

interface MasterPlanAIResponse {
  summary: string;
  phases: IPhase[];
  dailyHabits: IDailyHabit[];
  successMetrics: ISuccessMetric[];
  milestones: IMilestone[];
  systemMessage: string;
}

@Injectable()
export class GoalAnalyzerService {
  private readonly logger = new Logger(GoalAnalyzerService.name);

  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    private readonly openai: OpenAIService,
    private readonly honestRanking: HonestRankingService,
  ) {}

  /**
   * Analyze a goal and create a master plan
   */
  async analyzeAndCreatePlan(
    userId: string,
    goalText: string,
    timelineDays: number = 90,
  ): Promise<ISetGoalResponse> {
    this.logger.log(`Analyzing goal for user ${userId}: "${goalText.substring(0, 50)}..."`);

    // First, validate and analyze the goal
    const analysis = await this.analyzeGoal(goalText);
    
    if (!analysis.isValid) {
      throw new Error(`Goal needs refinement: ${analysis.suggestions.join(', ')}`);
    }

    // Use refined goal if provided
    const finalGoalText = analysis.refinedGoal || goalText;

    // Calculate target date
    const startDate = new Date();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + timelineDays);

    // Deactivate any existing active goals for this user
    // First, get the existing active goal to also delete related data
    const { data: existingGoal } = await this.supabase
      .from('user_master_goals')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (existingGoal) {
      this.logger.log(`Found existing active goal ${existingGoal.id}, deactivating...`);
      
      // Delete related quests first
      await this.supabase
        .from('ai_daily_quests')
        .delete()
        .eq('user_id', userId);

      // Delete related master plan
      await this.supabase
        .from('master_plans')
        .delete()
        .eq('goal_id', existingGoal.id);

      // Update the old goal to abandoned
      const { error: updateError } = await this.supabase
        .from('user_master_goals')
        .update({ status: 'abandoned' })
        .eq('id', existingGoal.id);

      if (updateError) {
        this.logger.error('Failed to deactivate existing goal:', updateError);
        // If we can't deactivate, delete it
        await this.supabase
          .from('user_master_goals')
          .delete()
          .eq('id', existingGoal.id);
        this.logger.log('Deleted existing goal instead');
      } else {
        this.logger.log('Existing goal deactivated successfully');
      }
    }

    // Create the master goal record
    const { data: goalData, error: goalError } = await this.supabase
      .from('user_master_goals')
      .insert({
        user_id: userId,
        goal_text: finalGoalText,
        timeline_days: timelineDays,
        start_date: startDate.toISOString().split('T')[0],
        target_date: targetDate.toISOString().split('T')[0],
        status: 'active',
        analyzed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (goalError) {
      this.logger.error('Failed to create goal:', goalError);
      throw new Error(`Failed to save goal: ${goalError.message}`);
    }

    // Generate the master plan using AI
    const planResponse = await this.generateMasterPlan(finalGoalText, timelineDays);

    // Save the master plan
    const { data: planData, error: planError } = await this.supabase
      .from('master_plans')
      .insert({
        user_id: userId,
        goal_id: goalData.id,
        summary: planResponse.summary,
        phases: planResponse.phases,
        daily_habits: planResponse.dailyHabits,
        success_metrics: planResponse.successMetrics,
        milestones: planResponse.milestones,
        raw_ai_response: planResponse,
      })
      .select()
      .single();

    if (planError) {
      this.logger.error('Failed to create plan:', planError);
      throw new Error(`Failed to save master plan: ${planError.message}`);
    }

    // Create milestone records
    await this.createMilestoneRecords(
      userId,
      goalData.id,
      planData.id,
      planResponse.milestones,
      startDate,
    );

    // Transform to interface types
    const goal: IMasterGoal = {
      id: goalData.id,
      userId: goalData.user_id,
      goalText: goalData.goal_text,
      analyzedAt: goalData.analyzed_at ? new Date(goalData.analyzed_at) : null,
      timelineDays: goalData.timeline_days,
      startDate: new Date(goalData.start_date),
      targetDate: new Date(goalData.target_date),
      status: goalData.status,
      createdAt: new Date(goalData.created_at),
      updatedAt: new Date(goalData.updated_at),
    };

    const masterPlan: IMasterPlan = {
      id: planData.id,
      userId: planData.user_id,
      goalId: planData.goal_id,
      summary: planData.summary,
      phases: planData.phases,
      dailyHabits: planData.daily_habits,
      successMetrics: planData.success_metrics,
      milestones: planData.milestones,
      version: planData.version,
      createdAt: new Date(planData.created_at),
      updatedAt: new Date(planData.updated_at),
    };

    return {
      goal,
      masterPlan,
      systemMessage: planResponse.systemMessage,
    };
  }

  /**
   * Analyze a goal for SMART criteria
   */
  private async analyzeGoal(goalText: string): Promise<IGoalAnalysis> {
    if (!this.openai.isAvailable()) {
      // Fallback: basic validation
      return this.basicGoalValidation(goalText);
    }

    const result = await this.openai.createJsonCompletion<IGoalAnalysis>({
      messages: [
        {
          role: 'system',
          content: `You are an expert goal analyst. Evaluate goals using SMART criteria and provide structured feedback.
          
Return JSON with this structure:
{
  "isValid": boolean (true if goal is good enough to proceed),
  "clarity": number (1-10),
  "measurability": number (1-10),
  "achievability": number (1-10),
  "relevance": number (1-10),
  "timebound": number (1-10),
  "suggestions": string[] (improvements if needed),
  "refinedGoal": string (optional: improved version of the goal)
}

Be lenient - most goals should be considered valid if they express clear intent.
Only reject goals that are too vague (e.g., "be better") or harmful.`,
        },
        {
          role: 'user',
          content: `Analyze this goal: "${goalText}"`,
        },
      ],
      temperature: 0.3,
    });

    if (!result.success || !result.data) {
      return this.basicGoalValidation(goalText);
    }

    return result.data;
  }

  /**
   * Basic goal validation fallback
   */
  private basicGoalValidation(goalText: string): IGoalAnalysis {
    const trimmed = goalText.trim();
    const wordCount = trimmed.split(/\s+/).length;

    const isValid = trimmed.length >= 10 && wordCount >= 3;

    return {
      isValid,
      clarity: isValid ? 7 : 3,
      measurability: 5,
      achievability: 7,
      relevance: 7,
      timebound: 5,
      suggestions: isValid ? [] : ['Please provide a more detailed goal description'],
    };
  }

  /**
   * Generate a comprehensive master plan using AI
   * Now supports optional honest ranking for personalized plans
   */
  private async generateMasterPlan(
    goalText: string,
    timelineDays: number,
    honestRank?: HunterRank,
    percentile?: number,
  ): Promise<MasterPlanAIResponse> {
    if (!this.openai.isAvailable()) {
      return this.generateFallbackPlan(goalText, timelineDays);
    }

    const prompt = this.buildMasterPlanPrompt(goalText, timelineDays, honestRank, percentile);

    const result = await this.openai.createJsonCompletion<MasterPlanAIResponse>({
      messages: [
        {
          role: 'system',
          content: `${this.openai.getSystemPersonalityPrompt()}

You are creating a MASTER PLAN for a Hunter's journey. This plan will guide their daily quests and track their progress toward the TOP 1% in their chosen domain.

GROWTH MINDSET INTEGRATION:
- The Hunter's current rank is their STARTING POINT, not their CEILING
- Emphasize effort-based progress over talent-based expectations
- Build in recovery from inevitable setbacks
- Celebrate process and improvement, not just outcomes

RETURN JSON with this EXACT structure:
{
  "summary": "A dramatic 2-3 sentence summary of the journey ahead in System voice",
  "phases": [
    {
      "number": 1,
      "name": "Phase Name",
      "description": "What this phase focuses on",
      "durationDays": 30,
      "startDay": 1,
      "endDay": 30,
      "focus": ["key", "focus", "areas"],
      "habits": ["daily habits for this phase"],
      "expectedOutcomes": ["what hunter will achieve"]
    }
  ],
  "dailyHabits": [
    {
      "id": "habit-1",
      "title": "Habit Title",
      "description": "System-style description",
      "category": "physical|mental|productivity|wellness|social",
      "difficulty": "easy|medium|hard",
      "frequency": "daily",
      "targetValue": 30,
      "metricKey": "minutes",
      "xpReward": 50,
      "statBonus": "strength|agility|intelligence|vitality"
    }
  ],
  "successMetrics": [
    {
      "id": "metric-1",
      "name": "Metric Name",
      "description": "What this measures",
      "targetValue": 100,
      "currentValue": 0,
      "unit": "units",
      "measurementFrequency": "daily|weekly|monthly"
    }
  ],
  "milestones": [
    {
      "index": 0,
      "title": "Milestone Title",
      "description": "What achieving this means",
      "targetDay": 30,
      "criteria": ["specific", "completion", "criteria"],
      "reward": {
        "xp": 500,
        "shadowUnlock": "optional_shadow_id"
      }
    }
  ],
  "systemMessage": "A dramatic System notification announcing the plan in 2-3 sentences"
}

IMPORTANT:
- Create 3-4 phases that build on each other
- Include 5-7 daily habits that are realistic and measurable
- Create 4-6 milestones spread across the timeline
- All text should be in System voice (dramatic, authoritative)
- XP rewards should scale: easy=20-40, medium=40-80, hard=80-150`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 3000,
    });

    if (!result.success || !result.data) {
      this.logger.warn('AI plan generation failed, using fallback');
      return this.generateFallbackPlan(goalText, timelineDays);
    }

    return result.data;
  }

  /**
   * Build the prompt for master plan generation
   * Now includes Growth Mindset principles and honest ranking context
   */
  private buildMasterPlanPrompt(
    goalText: string,
    timelineDays: number,
    honestRank?: HunterRank,
    percentile?: number,
  ): string {
    // Detect goal category for context
    const category = this.honestRanking.detectCategoryFromGoal(goalText);
    const aRankBenchmark = category.benchmarks.find(b => b.rank === 'A');
    
    let rankContext = '';
    if (honestRank && percentile !== undefined) {
      rankContext = `
HONEST ASSESSMENT:
- Current Rank: ${honestRank}-Rank (${percentile}th percentile)
- This Hunter is aiming for A-Rank (Top 1%): ${aRankBenchmark?.description || 'Elite level'}
- Gap to close: ${this.getGapDescription(honestRank)}
`;
    }

    return `
◇ [NEW HUNTER GOAL RECEIVED] ◇

GOAL: "${goalText}"
GOAL CATEGORY: ${category.name}
TIMELINE: ${timelineDays} days
START DATE: Today
${rankContext}
◇ [GROWTH MINDSET PRINCIPLES - CAROL DWECK] ◇
Apply these principles throughout the plan:
1. EFFORT IS THE PATH - Talent is just the starting point. Consistent effort creates mastery.
2. EMBRACE CHALLENGES - Hard things are opportunities for growth, not threats.
3. LEARN FROM FAILURE - Every setback contains a lesson. Failure is not a final state.
4. PERSISTENCE OVER PERFECTION - Progress matters more than perfect execution.
5. THE POWER OF "YET" - "I can't do this" becomes "I can't do this YET."

Create a comprehensive Master Plan that will transform this Hunter.
The plan should:
1. Break the journey into 3-4 progressive phases (each building on the last)
2. Define 5-7 core daily habits that directly support the goal
3. Set 4-6 major milestones to track progress toward TOP 1%
4. Include measurable success metrics based on real benchmarks
5. All text in dramatic System voice
6. Acknowledge the honest starting point while emphasizing growth potential

Consider:
- What skills need to be developed to reach A-Rank?
- What habits do top 1% performers practice daily?
- How should difficulty progress to build resilience?
- What are the key checkpoints that signal rank advancement?
- Where will the Hunter face setbacks, and how should they respond?

CRITICAL: The plan must be REALISTIC about the work required while OPTIMISTIC about the Hunter's potential to grow. No empty motivation - concrete actions that lead to measurable improvement.

Generate the complete Master Plan now.`;
  }

  /**
   * Get gap description based on current rank
   */
  private getGapDescription(rank: HunterRank): string {
    const gaps: Record<HunterRank, string> = {
      'F': '5 ranks to climb. This is a multi-year journey requiring complete lifestyle transformation.',
      'E': '4 ranks to climb. Significant work needed but foundation is forming.',
      'D': '3 ranks to climb. Average to elite requires dedicated daily effort.',
      'C': '2 ranks to climb. Above average to top 1% means outworking most people.',
      'B': '1 rank to climb. Top 10% to top 1% is the hardest gap - details matter.',
      'A': 'Maintaining elite status. Continuous improvement required.',
      'S': 'World-class level. Lead by example.',
    };
    return gaps[rank];
  }

  /**
   * Generate fallback plan when AI is unavailable
   */
  private generateFallbackPlan(goalText: string, timelineDays: number): MasterPlanAIResponse {
    const phaseDuration = Math.floor(timelineDays / 3);
    
    return {
      summary: `◇ [MASTER PLAN INITIALIZED] ◇ Hunter, your journey toward "${goalText.substring(0, 50)}" begins now. The System has analyzed your objective and prepared a ${timelineDays}-day transformation protocol.`,
      phases: [
        {
          number: 1,
          name: 'Foundation Phase',
          description: 'Build the fundamental habits and mindset required for success.',
          durationDays: phaseDuration,
          startDay: 1,
          endDay: phaseDuration,
          focus: ['Building habits', 'Setting routines', 'Initial progress'],
          habits: ['Daily check-in', 'Morning planning', 'Progress tracking'],
          expectedOutcomes: ['Consistent daily action', 'Clear routine established'],
        },
        {
          number: 2,
          name: 'Acceleration Phase',
          description: 'Intensify efforts and push beyond initial comfort zone.',
          durationDays: phaseDuration,
          startDay: phaseDuration + 1,
          endDay: phaseDuration * 2,
          focus: ['Increasing intensity', 'Overcoming obstacles', 'Building momentum'],
          habits: ['Extended sessions', 'Progress reviews', 'Skill development'],
          expectedOutcomes: ['Visible progress', 'Increased capability'],
        },
        {
          number: 3,
          name: 'Mastery Phase',
          description: 'Consolidate gains and achieve the final goal.',
          durationDays: timelineDays - (phaseDuration * 2),
          startDay: phaseDuration * 2 + 1,
          endDay: timelineDays,
          focus: ['Final push', 'Goal completion', 'Sustainable habits'],
          habits: ['Daily optimization', 'Performance tracking', 'Celebration rituals'],
          expectedOutcomes: ['Goal achievement', 'Lasting transformation'],
        },
      ],
      dailyHabits: [
        {
          id: 'habit-morning',
          title: 'Morning Power Protocol',
          description: '◇ Begin each day with intention. Review your goals and plan your quests.',
          category: 'productivity',
          difficulty: 'easy',
          frequency: 'daily',
          targetValue: 10,
          metricKey: 'minutes',
          xpReward: 25,
          statBonus: 'intelligence',
        },
        {
          id: 'habit-action',
          title: 'Core Action Block',
          description: '◇ Dedicate focused time to activities directly advancing your goal.',
          category: 'productivity',
          difficulty: 'medium',
          frequency: 'daily',
          targetValue: 60,
          metricKey: 'minutes',
          xpReward: 75,
          statBonus: 'strength',
        },
        {
          id: 'habit-physical',
          title: 'Physical Enhancement',
          description: '◇ A strong body supports a strong mind. Move daily.',
          category: 'physical',
          difficulty: 'medium',
          frequency: 'daily',
          targetValue: 30,
          metricKey: 'minutes',
          xpReward: 50,
          statBonus: 'vitality',
        },
        {
          id: 'habit-reflection',
          title: 'Evening Reflection',
          description: '◇ Review the day\'s progress. Learn from both victory and defeat.',
          category: 'mental',
          difficulty: 'easy',
          frequency: 'daily',
          targetValue: 5,
          metricKey: 'minutes',
          xpReward: 20,
          statBonus: 'intelligence',
        },
        {
          id: 'habit-rest',
          title: 'Recovery Protocol',
          description: '◇ Rest is not weakness. It is preparation for greater battles.',
          category: 'wellness',
          difficulty: 'easy',
          frequency: 'daily',
          targetValue: 7,
          metricKey: 'hours',
          xpReward: 30,
          statBonus: 'vitality',
        },
      ],
      successMetrics: [
        {
          id: 'metric-streak',
          name: 'Quest Completion Streak',
          description: 'Consecutive days completing all daily quests',
          targetValue: timelineDays,
          currentValue: 0,
          unit: 'days',
          measurementFrequency: 'daily',
        },
        {
          id: 'metric-completion',
          name: 'Overall Quest Completion Rate',
          description: 'Percentage of assigned quests completed',
          targetValue: 90,
          currentValue: 0,
          unit: 'percent',
          measurementFrequency: 'weekly',
        },
      ],
      milestones: [
        {
          index: 0,
          title: 'First Week Complete',
          description: 'You have survived the initial trial. Your journey has begun.',
          targetDay: 7,
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          criteria: ['Complete 7 consecutive days of quests'],
          reward: { xp: 250 },
        },
        {
          index: 1,
          title: 'Foundation Established',
          description: 'Phase 1 complete. Your habits are forming.',
          targetDay: phaseDuration,
          targetDate: new Date(Date.now() + phaseDuration * 24 * 60 * 60 * 1000),
          criteria: ['Complete Phase 1', '80%+ quest completion rate'],
          reward: { xp: 500, shadowUnlock: 'shadow_soldier_basic' },
        },
        {
          index: 2,
          title: 'Momentum Achieved',
          description: 'You have broken through initial resistance. Power builds.',
          targetDay: phaseDuration * 2,
          targetDate: new Date(Date.now() + phaseDuration * 2 * 24 * 60 * 60 * 1000),
          criteria: ['Complete Phase 2', 'Maintain streak'],
          reward: { xp: 750, shadowUnlock: 'shadow_knight' },
        },
        {
          index: 3,
          title: 'Goal Achieved',
          description: 'You have transcended your limits. The transformation is complete.',
          targetDay: timelineDays,
          targetDate: new Date(Date.now() + timelineDays * 24 * 60 * 60 * 1000),
          criteria: ['Complete all phases', 'Achieve primary goal'],
          reward: { xp: 1500, shadowUnlock: 'shadow_monarch' },
        },
      ],
      systemMessage: `◈ [MASTER PLAN CREATED] ◈ Hunter, your ${timelineDays}-day journey has been mapped. Follow the path, complete your quests, and transformation is inevitable. The System watches your progress.`,
    };
  }

  /**
   * Create milestone records in the database
   */
  private async createMilestoneRecords(
    userId: string,
    goalId: string,
    planId: string,
    milestones: IMilestone[],
    startDate: Date,
  ): Promise<void> {
    const records = milestones.map((milestone) => {
      const targetDate = new Date(startDate);
      targetDate.setDate(targetDate.getDate() + milestone.targetDay);

      return {
        user_id: userId,
        goal_id: goalId,
        plan_id: planId,
        milestone_index: milestone.index,
        title: milestone.title,
        description: milestone.description,
        target_date: targetDate.toISOString().split('T')[0],
        status: 'pending',
        bonus_xp_awarded: 0,
      };
    });

    const { error } = await this.supabase
      .from('milestone_records')
      .insert(records);

    if (error) {
      this.logger.error('Failed to create milestone records:', error);
      // Non-fatal, continue
    }
  }

  /**
   * Get the active master goal for a user
   */
  async getActiveGoal(userId: string): Promise<IMasterGoal | null> {
    const { data, error } = await this.supabase
      .from('user_master_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      goalText: data.goal_text,
      analyzedAt: data.analyzed_at ? new Date(data.analyzed_at) : null,
      timelineDays: data.timeline_days,
      startDate: new Date(data.start_date),
      targetDate: new Date(data.target_date),
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Get the master plan for a goal
   */
  async getMasterPlan(goalId: string): Promise<IMasterPlan | null> {
    const { data, error } = await this.supabase
      .from('master_plans')
      .select('*')
      .eq('goal_id', goalId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      goalId: data.goal_id,
      summary: data.summary,
      phases: data.phases,
      dailyHabits: data.daily_habits,
      successMetrics: data.success_metrics,
      milestones: data.milestones,
      version: data.version,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
