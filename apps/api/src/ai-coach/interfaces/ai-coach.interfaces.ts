/**
 * Solo Leveling System - AI Coach Interfaces
 * 
 * Type definitions for the AI-powered coaching system
 */

// ============================================================================
// MASTER GOAL TYPES
// ============================================================================

export interface IMasterGoal {
  id: string;
  userId: string;
  goalText: string;
  analyzedAt: Date | null;
  timelineDays: number;
  startDate: Date;
  targetDate: Date;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoalAnalysis {
  isValid: boolean;
  clarity: number; // 1-10
  measurability: number; // 1-10
  achievability: number; // 1-10
  relevance: number; // 1-10
  timebound: number; // 1-10
  suggestions: string[];
  refinedGoal?: string;
}

// ============================================================================
// MASTER PLAN TYPES
// ============================================================================

export interface IPhase {
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

export interface IDailyHabit {
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

export interface ISuccessMetric {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  measurementFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface IMilestone {
  index: number;
  title: string;
  description: string;
  targetDay: number;
  targetDate: Date;
  criteria: string[];
  reward: {
    xp: number;
    shadowUnlock?: string;
    achievementId?: string;
  };
}

export interface IMasterPlan {
  id: string;
  userId: string;
  goalId: string;
  summary: string;
  phases: IPhase[];
  dailyHabits: IDailyHabit[];
  successMetrics: ISuccessMetric[];
  milestones: IMilestone[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// AI DAILY QUEST TYPES
// ============================================================================

export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type QuestStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export interface IAIDailyQuest {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  questType: string;
  targetValue: number;
  currentValue: number;
  metricKey: string;
  xpReward: number;
  statBonus?: string;
  scheduledFor: Date;
  status: QuestStatus;
  completedAt?: Date;
  aiReasoning?: string;
  regenerationCount: number;
  phaseNumber?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGeneratedQuest {
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  questType: string;
  targetValue: number;
  metricKey: string;
  xpReward: number;
  statBonus?: string;
  aiReasoning?: string;
  phaseNumber?: number;
}

// ============================================================================
// WEEKLY REVIEW TYPES
// ============================================================================

export type PerformanceVerdict = 'excellent' | 'good' | 'adequate' | 'needs_improvement' | 'disappointing';
export type DifficultyAdjustment = 'increase' | 'decrease' | 'maintain';

export interface IWeeklyStats {
  totalQuests: number;
  completedQuests: number;
  failedQuests: number;
  skippedQuests: number;
  completionRate: number;
  xpEarned: number;
  streakMaintained: boolean;
  currentStreak: number;
  statsGained: Record<string, number>;
}

export interface IWeeklyReview {
  id: string;
  userId: string;
  goalId?: string;
  weekStart: Date;
  weekEnd: Date;
  verdict: PerformanceVerdict;
  completionRate: number;
  totalQuests: number;
  completedQuests: number;
  xpEarned: number;
  streakMaintained: boolean;
  statsGained: Record<string, number>;
  systemCommentary: string;
  achievementsUnlocked: string[];
  difficultyAdjustment?: DifficultyAdjustment;
  recommendations: string[];
  createdAt: Date;
}

// ============================================================================
// MILESTONE RECORD TYPES
// ============================================================================

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'missed';

export interface IMilestoneRecord {
  id: string;
  userId: string;
  goalId?: string;
  planId?: string;
  milestoneIndex: number;
  title: string;
  description?: string;
  targetDate: Date;
  status: MilestoneStatus;
  completionPercentage: number;
  completedAt?: Date;
  celebrationMessage?: string;
  shadowUnlocked?: string;
  bonusXpAwarded: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// USER CONTEXT FOR AI
// ============================================================================

export interface IUserContext {
  userId: string;
  level: number;
  jobClass: string;
  currentStreak: number;
  bestStreak: number;
  completedQuestsToday: number;
  totalQuestsCompleted: number;
  recentQuestTypes: string[];
  userGoals: string[];
  stats: {
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
  };
  masterGoal?: {
    goalText: string;
    daysElapsed: number;
    daysRemaining: number;
    currentPhase: number;
    progressPercentage: number;
  };
  recentPerformance?: {
    lastWeekCompletionRate: number;
    averageDifficulty: string;
    preferredQuestTypes: string[];
  };
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ISetGoalRequest {
  goalText: string;
  timelineDays?: number;
}

export interface ISetGoalResponse {
  goal: IMasterGoal;
  masterPlan: IMasterPlan;
  systemMessage: string;
}

export interface IGetDailyQuestsResponse {
  quests: IAIDailyQuest[];
  canRegenerate: boolean;
  regenerationsRemaining: number;
  goalProgress?: {
    percentage: number;
    daysElapsed: number;
    daysRemaining: number;
    currentPhase: string;
  };
}

export interface IRegenerateQuestsRequest {
  reason?: string;
}

export interface ICompleteQuestRequest {
  questId: string;
  actualValue?: number;
}

export interface ICompleteQuestResponse {
  quest: IAIDailyQuest;
  xpAwarded: number;
  statBonusApplied?: string;
  levelUp?: boolean;
  milestonesReached?: IMilestoneRecord[];
  systemMessage: string;
}

export interface IAICoachStatus {
  hasActiveGoal: boolean;
  goal?: IMasterGoal;
  masterPlan?: IMasterPlan;
  todaysQuests: IAIDailyQuest[];
  currentPhase?: IPhase;
  nextMilestone?: IMilestoneRecord;
  weeklyReviewDue: boolean;
  lastWeeklyReview?: IWeeklyReview;
  overallProgress: {
    percentage: number;
    daysElapsed: number;
    daysRemaining: number;
    questsCompleted: number;
    xpEarned: number;
  };
}

// ============================================================================
// OPENAI TYPES
// ============================================================================

export interface IOpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface IOpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface IOpenAIResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// CRON/SCHEDULER TYPES
// ============================================================================

export interface ISchedulerConfig {
  questGenerationTime: string; // HH:MM format
  weeklyReviewDay: number; // 0-6 (Sunday-Saturday)
  timezone: string;
}

export interface ICronResult {
  success: boolean;
  processedUsers: number;
  errors: string[];
  timestamp: Date;
}
