/**
 * Solo Leveling System - Assessment Service
 * 
 * Handles the conversational assessment flow where AI asks probing questions
 * to determine the user's honest rank before creating their plan.
 * 
 * Combines:
 * 1. Wearable health data (if available)
 * 2. User-answered questions
 * 3. AI conversation to fill gaps
 */

import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { HonestRankingService, GoalCategory, HonestAssessment, HunterRank } from './honest-ranking.service';

export interface AssessmentSession {
  sessionId: string;
  userId: string;
  goalText: string;
  detectedCategory: GoalCategory;
  healthData: Record<string, any> | null;
  userAnswers: Record<string, number | string | boolean>;
  conversationHistory: ConversationMessage[];
  stage: 'intro' | 'questions' | 'health_check' | 'analysis' | 'complete';
  assessment: HonestAssessment | null;
  createdAt: Date;
}

export interface ConversationMessage {
  role: 'system' | 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'number' | 'boolean' | 'select' | 'text';
  options?: string[];
  required: boolean;
}

@Injectable()
export class AssessmentService {
  private readonly logger = new Logger(AssessmentService.name);
  private sessions: Map<string, AssessmentSession> = new Map();

  constructor(
    private readonly openaiService: OpenAIService,
    private readonly rankingService: HonestRankingService,
  ) {}

  /**
   * Start a new assessment session
   */
  async startAssessment(
    userId: string,
    goalText: string,
    healthData?: Record<string, any>,
  ): Promise<{
    sessionId: string;
    category: GoalCategory;
    introMessage: string;
    questions: AssessmentQuestion[];
  }> {
    const sessionId = `assess_${userId}_${Date.now()}`;
    
    // Detect category from goal text
    const category = this.rankingService.detectCategoryFromGoal(goalText);
    
    const session: AssessmentSession = {
      sessionId,
      userId,
      goalText,
      detectedCategory: category,
      healthData: healthData || null,
      userAnswers: {},
      conversationHistory: [],
      stage: 'intro',
      assessment: null,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);

    // Generate intro message
    const introMessage = await this.generateIntroMessage(goalText, category, healthData);
    
    session.conversationHistory.push({
      role: 'assistant',
      content: introMessage,
      timestamp: new Date(),
    });

    // Get questions for this category
    const questions = this.getQuestionsForCategory(category);

    return {
      sessionId,
      category,
      introMessage,
      questions,
    };
  }

  /**
   * Submit answers and get honest assessment
   */
  async submitAnswers(
    sessionId: string,
    answers: Record<string, number | string | boolean>,
  ): Promise<{
    assessment: HonestAssessment;
    followUpMessage: string;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Assessment session not found');
    }

    session.userAnswers = { ...session.userAnswers, ...answers };
    session.stage = 'analysis';

    // Convert answers to metrics
    const metrics = this.convertAnswersToMetrics(answers);

    // Merge with health data if available
    if (session.healthData) {
      this.mergeHealthDataIntoMetrics(metrics, session.healthData);
    }

    // Calculate honest assessment
    const assessment = this.rankingService.generateHonestAssessment(
      session.goalText,
      session.detectedCategory.id,
      metrics,
      session.healthData || undefined,
    );

    session.assessment = assessment;
    session.stage = 'complete';

    // Generate follow-up message with AI
    const followUpMessage = await this.generateFollowUpMessage(session, assessment);

    session.conversationHistory.push({
      role: 'assistant',
      content: followUpMessage,
      timestamp: new Date(),
    });

    return {
      assessment,
      followUpMessage,
    };
  }

  /**
   * Get assessment session
   */
  getSession(sessionId: string): AssessmentSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Generate conversational intro message
   */
  private async generateIntroMessage(
    goalText: string,
    category: GoalCategory,
    healthData?: Record<string, any>,
  ): Promise<string> {
    const hasHealthData = healthData && Object.keys(healthData).length > 0;

    const prompt = `You are a brutally honest fitness coach conducting an assessment. The user has set a goal and wants to reach the TOP 1% in their domain.

USER'S GOAL: "${goalText}"
DETECTED CATEGORY: ${category.name}
HAS WEARABLE DATA: ${hasHealthData ? 'Yes - we have real data from their device' : 'No - we need to ask questions'}

Generate a SHORT, DIRECT intro message (2-3 sentences max) that:
1. Acknowledges their goal
2. Explains you'll be assessing where they HONESTLY stand right now
3. Makes clear this assessment is about REALITY, not feelings
4. If they have wearable data, mention you'll use it

Be direct, not mean. Be honest, not discouraging. Channel the spirit of a tough but fair coach.

Example tone: "You want to run a marathon. Good. Let's find out if you're ready or if you're dreaming. I'm going to ask you some questions - answer honestly, because lying to yourself is the first step to failure."

RESPOND WITH JUST THE MESSAGE, NO QUOTES OR LABELS.`;

    try {
      const result = await this.openaiService.createCompletion({
        messages: [
          { role: 'system', content: 'You are a brutally honest fitness coach. Be direct and concise.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        maxTokens: 300,
      });
      
      if (result.success && result.content) {
        return result.content;
      }
      throw new Error(result.error || 'Failed to generate');
    } catch (error) {
      this.logger.error('Failed to generate intro message:', error);
      return this.getFallbackIntroMessage(goalText, category, hasHealthData);
    }
  }

  /**
   * Generate follow-up message after assessment
   */
  private async generateFollowUpMessage(
    session: AssessmentSession,
    assessment: HonestAssessment,
  ): Promise<string> {
    const prompt = `You are delivering the results of a brutally honest fitness assessment. The user wanted to reach the TOP 1% in ${assessment.goalCategory}.

ASSESSMENT RESULTS:
- Current Rank: ${assessment.currentRank}-Rank
- Percentile: ${assessment.percentile}% (${assessment.percentile < 50 ? 'below average' : assessment.percentile < 75 ? 'average' : assessment.percentile < 90 ? 'above average' : assessment.percentile < 99 ? 'top 10%' : 'elite'})
- Their Goal: ${session.goalText}
- What Top 1% (A-Rank) Looks Like: ${assessment.topOnePercentLooksLike}
- Estimated Years to Reach Top 1%: ${assessment.estimatedYearsToTop} years

THEIR METRICS:
${assessment.metrics.map(m => `- ${m.name}: ${m.currentValue} ${m.unit} (${m.percentile}th percentile)`).join('\n')}

Generate a BRUTALLY HONEST message (4-6 sentences) that:
1. States their rank clearly and what it means
2. Does NOT sugarcoat - if they're F-rank, tell them they're starting from zero
3. Shows the gap between where they are and where they want to be
4. BUT ends with a Growth Mindset message - their current state is NOT their destiny
5. Emphasizes that reaching the top 1% is HARD but POSSIBLE with sustained effort

KEY PRINCIPLE FROM CAROL DWECK'S MINDSET:
"The passion for stretching yourself and sticking to it, even when it's not going well, is the hallmark of the growth mindset."

Be like a tough but caring coach who believes in their potential but won't lie to them.

RESPOND WITH JUST THE MESSAGE, NO QUOTES OR LABELS.`;

    try {
      const result = await this.openaiService.createCompletion({
        messages: [
          { role: 'system', content: 'You are a brutally honest fitness coach delivering assessment results. Be direct but motivating.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        maxTokens: 500,
      });
      
      if (result.success && result.content) {
        return result.content;
      }
      throw new Error(result.error || 'Failed to generate');
    } catch (error) {
      this.logger.error('Failed to generate follow-up message:', error);
      return this.getFallbackFollowUpMessage(assessment);
    }
  }

  /**
   * Get questions for a category
   */
  private getQuestionsForCategory(category: GoalCategory): AssessmentQuestion[] {
    const baseQuestions: AssessmentQuestion[] = [
      {
        id: 'experience_years',
        question: 'How many years have you been working on this or something similar?',
        type: 'number',
        required: true,
      },
      {
        id: 'current_frequency',
        question: 'How many times per week do you currently practice/train?',
        type: 'number',
        required: true,
      },
      {
        id: 'self_rating',
        question: 'On a scale of 1-10, how would you HONESTLY rate your current ability? (1 = complete beginner, 10 = professional level)',
        type: 'number',
        required: true,
      },
    ];

    // Add category-specific questions
    const categoryQuestions: AssessmentQuestion[] = category.metrics.map(m => ({
      id: m.id,
      question: m.question,
      type: m.unit === 'boolean' ? 'boolean' : 'number',
      required: m.importance === 'critical',
    }));

    return [...baseQuestions, ...categoryQuestions];
  }

  /**
   * Convert user answers to metrics for ranking
   */
  private convertAnswersToMetrics(answers: Record<string, number | string | boolean>): Record<string, number> {
    const metrics: Record<string, number> = {};

    for (const [key, value] of Object.entries(answers)) {
      if (typeof value === 'number') {
        metrics[key] = value;
      } else if (typeof value === 'boolean') {
        metrics[key] = value ? 1 : 0;
      } else if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
          metrics[key] = parsed;
        }
      }
    }

    return metrics;
  }

  /**
   * Merge health data into metrics
   */
  private mergeHealthDataIntoMetrics(
    metrics: Record<string, number>,
    healthData: Record<string, any>,
  ): void {
    // Map health data fields to metric fields
    if (healthData.steps) {
      metrics.daily_steps = healthData.steps;
    }
    if (healthData.activeCalories) {
      metrics.active_calories = healthData.activeCalories;
    }
    if (healthData.workouts && Array.isArray(healthData.workouts)) {
      metrics.weekly_workouts = healthData.workouts.length;
      const totalDuration = healthData.workouts.reduce(
        (sum: number, w: any) => sum + (w.durationMinutes || 0),
        0,
      );
      metrics.workout_duration = totalDuration / healthData.workouts.length || 0;
    }
    if (healthData.sleepMinutes) {
      metrics.sleep_hours = healthData.sleepMinutes / 60;
    }
    if (healthData.restingHeartRate) {
      metrics.resting_hr = healthData.restingHeartRate;
    }
  }

  /**
   * Fallback intro message
   */
  private getFallbackIntroMessage(
    goalText: string,
    category: GoalCategory,
    hasHealthData: boolean,
  ): string {
    if (hasHealthData) {
      return `You want to achieve: "${goalText}". I have your real fitness data from your wearable device. Let's see exactly where you stand compared to everyone else pursuing this goal. Answer the following questions honestly - I'll combine them with your data to give you a REAL assessment. No sugarcoating.`;
    }
    return `You want to achieve: "${goalText}". Good. Now let's find out if you're ready or if you're dreaming. I'm going to ask you some questions - answer honestly, because lying to yourself is the first step to failure. This assessment is about reality, not feelings.`;
  }

  /**
   * Fallback follow-up message
   */
  private getFallbackFollowUpMessage(assessment: HonestAssessment): string {
    const rankMessages: Record<HunterRank, string> = {
      'F': `You're ${assessment.currentRank}-Rank - at the ${assessment.percentile}th percentile. That means you're starting from the very bottom. ${assessment.topOnePercentLooksLike} - that's what the top 1% looks like. You're years away from that. But here's the truth: EVERYONE at the top started at the bottom. Your current rank is not your destiny - it's just your starting point. The question is: are you willing to put in the ${assessment.estimatedYearsToTop}+ years of consistent work it takes?`,
      'E': `You're ${assessment.currentRank}-Rank - at the ${assessment.percentile}th percentile. Below average, but you've started. The top 1% (${assessment.topOnePercentLooksLike}) is still far away - about ${assessment.estimatedYearsToTop} years of dedicated work. But you've already proven you can begin. Now prove you can continue. Your effort, not your starting point, determines where you end up.`,
      'D': `You're ${assessment.currentRank}-Rank - at the ${assessment.percentile}th percentile. Average. Like most people. The question is: do you want to be like most people? The top 1% (${assessment.topOnePercentLooksLike}) requires about ${assessment.estimatedYearsToTop} more years of focused work. Being average is a choice. What do you choose?`,
      'C': `You're ${assessment.currentRank}-Rank - at the ${assessment.percentile}th percentile. Above average. You've put in real work. But the top 1% (${assessment.topOnePercentLooksLike}) is still ahead. You need about ${assessment.estimatedYearsToTop} more years of elite-level effort. You've proven you can work - now prove you can work at the highest level.`,
      'B': `You're ${assessment.currentRank}-Rank - at the ${assessment.percentile}th percentile. Top 10%. Impressive by any normal standard. But you're not aiming for normal. The top 1% (${assessment.topOnePercentLooksLike}) is within reach - about ${assessment.estimatedYearsToTop} year of focused work. You're close. Don't stop now.`,
      'A': `You're ${assessment.currentRank}-Rank - at the ${assessment.percentile}th percentile. Top 1%. You've achieved what most only dream of. ${assessment.topOnePercentLooksLike} - that's you. Now the question is: can you maintain it? Or push to S-Rank? The work never ends at this level.`,
      'S': `You're ${assessment.currentRank}-Rank - at the ${assessment.percentile}th percentile. World class. ${assessment.topOnePercentLooksLike}. You are among the best. But the moment you stop improving, you start declining. Stay hungry. Stay humble.`,
    };

    return rankMessages[assessment.currentRank];
  }

  /**
   * Clean up old sessions (call periodically)
   */
  cleanupOldSessions(maxAgeHours: number = 24): void {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.createdAt < cutoff) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
