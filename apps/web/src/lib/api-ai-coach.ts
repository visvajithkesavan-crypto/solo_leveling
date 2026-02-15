/**
 * Solo Leveling System - AI Coach API Client
 * 
 * Frontend API functions for the AI coaching system.
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============================================================================
// TYPES
// ============================================================================

export interface MasterGoal {
  id: string;
  userId: string;
  goalText: string;
  analyzedAt: string | null;
  timelineDays: number;
  timelineMonths: number;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface Phase {
  phaseNumber: number;
  number: number;
  name: string;
  description: string;
  durationDays: number;
  startDay: number;
  endDay: number;
  focus: string[];
  habits: string[];
  expectedOutcomes: string[];
}

export interface DailyHabit {
  id: string;
  title: string;
  description: string;
  category: 'physical' | 'mental' | 'productivity' | 'wellness' | 'social';
  difficulty: 'easy' | 'medium' | 'hard';
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  targetValue?: number;
  metricKey?: string;
  xpReward: number;
  statBonus?: string;
}

export interface Milestone {
  id?: string;
  index: number;
  title: string;
  description: string;
  targetDay: number;
  targetDate: string;
  criteria: string[];
  completedAt?: string;
  reward: {
    xp: number;
    shadowUnlock?: string;
  };
}

export interface MasterPlan {
  id: string;
  userId: string;
  goalId: string;
  summary: string;
  currentPhase: number;
  phases: Phase[];
  dailyHabits: DailyHabit[];
  successMetrics: any[];
  milestones: Milestone[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIDailyQuest {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  questType: string;
  targetValue: number;
  currentValue: number;
  metricKey: string;
  xpReward: number;
  statBonus?: string;
  scheduledFor: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  completedAt?: string;
  aiReasoning?: string;
  regenerationCount: number;
  phaseNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  goalId?: string;
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  verdict: 'excellent' | 'good' | 'adequate' | 'needs_improvement' | 'disappointing';
  completionRate: number;
  questsTotal: number;
  questsCompleted: number;
  xpEarned: number;
  streakDays: number;
  consistencyScore: number;
  aiInsights: string;
  strengths: string[];
  areasToImprove: string[];
  recommendations: string[];
  difficultyAdjustment: number;
  createdAt: string;
}

export interface MilestoneRecord {
  id: string;
  userId: string;
  goalId?: string;
  milestoneIndex: number;
  title: string;
  description?: string;
  targetDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'missed';
  completionPercentage: number;
  completedAt?: string;
  celebrationMessage?: string;
  shadowUnlocked?: string;
  bonusXpAwarded: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgress {
  percentage: number;
  daysElapsed: number;
  daysRemaining: number;
  currentPhase: string;
}

export interface DailyQuestsResponse {
  quests: AIDailyQuest[];
  canRegenerate: boolean;
  regenerationsRemaining: number;
  goalProgress?: GoalProgress;
}

export interface AICoachStatus {
  hasActiveGoal: boolean;
  goal?: MasterGoal;
  masterPlan?: MasterPlan;
  todaysQuests: AIDailyQuest[];
  currentPhase?: Phase;
  nextMilestone?: MilestoneRecord;
  weeklyReviewDue: boolean;
  lastWeeklyReview?: WeeklyReview;
  overallProgress: {
    percentage: number;
    daysElapsed: number;
    daysRemaining: number;
    questsCompleted: number;
    xpEarned: number;
  };
}

export interface SetGoalResponse {
  goal: MasterGoal;
  masterPlan: MasterPlan;
  systemMessage: string;
}

export interface CompleteQuestResponse {
  quest: AIDailyQuest;
  xpAwarded: number;
  statBonusApplied?: string;
  levelUp?: boolean;
  milestonesReached?: MilestoneRecord[];
  systemMessage: string;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class AICoachApiClient {
  private supabase = createClientComponentClient();

  private async getAuthHeaders(): Promise<HeadersInit> {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  /**
   * Set a new goal and generate master plan
   */
  async setGoal(goalText: string, timelineDays?: number): Promise<SetGoalResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/ai-coach/set-goal`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ goalText, timelineDays }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to set goal');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get the user's master plan
   */
  async getMasterPlan(): Promise<{ goal: MasterGoal; masterPlan: MasterPlan } | null> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/ai-coach/master-plan`, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch master plan');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get today's AI-generated quests
   */
  async getDailyQuests(): Promise<DailyQuestsResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/ai-coach/daily-quests`, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch daily quests');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Regenerate daily quests
   */
  async regenerateQuests(reason?: string): Promise<DailyQuestsResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/ai-coach/regenerate-quests`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to regenerate quests');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Complete a quest
   */
  async completeQuest(questId: string, actualValue?: number): Promise<CompleteQuestResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/ai-coach/complete-quest`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ questId, actualValue }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to complete quest');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get weekly performance review
   */
  async getWeeklyReview(): Promise<{ review: WeeklyReview | null; isDue: boolean }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/ai-coach/weekly-review`, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch weekly review');
    }

    const result = await response.json();
    return { review: result.data, isDue: result.isDue };
  }

  /**
   * Trigger weekly review manually
   */
  async triggerWeeklyReview(): Promise<WeeklyReview> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/ai-coach/trigger-review`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to trigger review');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get milestones
   */
  async getMilestones(): Promise<{
    milestones: MilestoneRecord[];
    nextMilestone: MilestoneRecord | null;
  }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/ai-coach/milestones`, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch milestones');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get comprehensive AI coach status
   */
  async getStatus(): Promise<AICoachStatus> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/ai-coach/status`, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch AI coach status');
    }

    const result = await response.json();
    return result.data;
  }
}

export const aiCoachApi = new AICoachApiClient();
