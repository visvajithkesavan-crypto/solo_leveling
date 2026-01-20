/**
 * Shared types for Solo Leveling System
 */

/**
 * Goal/Quest status enum
 */
export enum QuestStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * Goal/Quest difficulty level
 */
export enum QuestDifficulty {
  E_RANK = 'E_RANK',
  D_RANK = 'D_RANK',
  C_RANK = 'C_RANK',
  B_RANK = 'B_RANK',
  A_RANK = 'A_RANK',
  S_RANK = 'S_RANK'
}

/**
 * Core Goal entity
 */
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status?: QuestStatus;
  difficulty?: QuestDifficulty;
  xp_reward?: number;
  progress?: number;
  target?: number;
  created_at: string;
  updated_at?: string;
}

/**
 * DTO for creating a goal
 */
export interface CreateGoalDto {
  title: string;
  description?: string;
  difficulty?: QuestDifficulty;
}

/**
 * DTO for updating a goal
 */
export interface UpdateGoalDto {
  title?: string;
  description?: string;
  status?: QuestStatus;
  difficulty?: QuestDifficulty;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// QUEST ENGINE TYPES & ENUMS
// ============================================================================

/**
 * Quest state enum
 */
export enum QuestState {
  ASSIGNED = 'assigned',
  PASSED = 'passed',
  FAILED = 'failed'
}

/**
 * Quest attempt result
 */
export enum AttemptResult {
  PASS = 'pass',
  FAIL = 'fail'
}

/**
 * XP source types
 */
export enum XPSource {
  QUEST = 'quest',
  BONUS = 'bonus',
  MANUAL = 'manual'
}

/**
 * Quest kind
 */
export enum QuestKind {
  DAILY = 'daily'
}

/**
 * Level State entity
 */
export interface LevelState {
  user_id: string;
  level: number;
  xp: number;
  created_at: string;
  updated_at: string;
}

/**
 * XP Ledger entry
 */
export interface XPLedger {
  id: string;
  user_id: string;
  source: XPSource;
  amount: number;
  quest_id?: string;
  created_at: string;
}

/**
 * Quest entity
 */
export interface Quest {
  id: string;
  user_id: string;
  goal_id?: string;
  kind: QuestKind;
  title: string;
  target_value: number;
  metric_key: string;
  scheduled_for: string; // date string YYYY-MM-DD
  state: QuestState;
  created_at: string;
  updated_at: string;
}

/**
 * Quest Attempt entity
 */
export interface QuestAttempt {
  id: string;
  user_id: string;
  quest_id: string;
  source: string;
  verified: boolean;
  observed_value: number;
  result?: AttemptResult;
  attempted_at: string;
}

/**
 * Streak entity
 */
export interface Streak {
  id: string;
  user_id: string;
  streak_key: string;
  current: number;
  best: number;
  updated_at: string;
}

/**
 * Status Window data
 */
export interface StatusWindow {
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  bestStreak: number;
}

/**
 * Quest result after evaluation
 */
export interface QuestResult {
  quest_id: string;
  title: string;
  state: QuestState;
  xp_earned: number;
}

/**
 * Popup event types
 */
export enum PopupEventType {
  QUEST_COMPLETED = 'quest_completed',
  QUEST_FAILED = 'quest_failed',
  LEVEL_UP = 'level_up',
  STREAK_MILESTONE = 'streak_milestone'
}

/**
 * Popup event
 */
export interface PopupEvent {
  type: PopupEventType;
  title: string;
  message: string;
  data?: any;
}

/**
 * Evaluation response
 */
export interface EvaluationResponse {
  statusWindow: StatusWindow;
  questResults: QuestResult[];
  popupEvents: PopupEvent[];
}

// ============================================================================
// QUEST ENGINE FORMULAS
// ============================================================================

/**
 * XP calculation constants
 */
export const XP_CONSTANTS = {
  BASE_XP: 50,
  VERIFIED_MULTIPLIER: 1.0,
  UNVERIFIED_MULTIPLIER: 0.4,
  MAX_STREAK_BONUS: 30,
  STREAK_BONUS_PER_DAY: 2,
};

/**
 * Calculate XP for a quest completion
 * 
 * Formula:
 * - base_xp = 50
 * - multiplier = verified ? 1.0 : 0.4
 * - streak_bonus = min(current_streak * 2, 30)
 * - total_xp = (base_xp * multiplier) + streak_bonus
 */
export function calculateQuestXp(params: {
  verified: boolean;
  currentStreak: number;
}): number {
  const { verified, currentStreak } = params;
  
  const multiplier = verified 
    ? XP_CONSTANTS.VERIFIED_MULTIPLIER 
    : XP_CONSTANTS.UNVERIFIED_MULTIPLIER;
  
  const baseXp = XP_CONSTANTS.BASE_XP * multiplier;
  
  const streakBonus = Math.min(
    currentStreak * XP_CONSTANTS.STREAK_BONUS_PER_DAY,
    XP_CONSTANTS.MAX_STREAK_BONUS
  );
  
  return Math.floor(baseXp + streakBonus);
}

/**
 * Calculate XP required to reach next level
 * 
 * Formula: xp_to_next(level) = 250 * level^2 + 750 * level
 */
export function xpToNextLevel(level: number): number {
  return 250 * level * level + 750 * level;
}

/**
 * Apply XP gain and handle level-ups
 * 
 * Returns new level and remaining XP after all level-ups
 */
export function applyXp(
  currentLevel: number,
  currentXp: number,
  xpGained: number
): { level: number; xp: number; levelsGained: number } {
  let level = currentLevel;
  let xp = currentXp + xpGained;
  let levelsGained = 0;
  
  // Keep leveling up while we have enough XP
  while (true) {
    const xpNeeded = xpToNextLevel(level);
    
    if (xp >= xpNeeded) {
      xp -= xpNeeded;
      level++;
      levelsGained++;
    } else {
      break;
    }
  }
  
  return { level, xp, levelsGained };
}

// Export new gamification systems
export * from './types/job-class';
export * from './types/achievements';
export * from './types/shadow-soldiers';
