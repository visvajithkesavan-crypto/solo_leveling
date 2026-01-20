/**
 * Solo Leveling System - Achievements
 * 
 * Achievement badges and unlock conditions
 */

export enum AchievementCategory {
  QUESTS = 'quests',
  STREAKS = 'streaks',
  LEVEL = 'level',
  STATS = 'stats',
  SPECIAL = 'special',
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  condition: AchievementCondition;
  hidden?: boolean; // Secret achievements
}

export interface AchievementCondition {
  type: 'quest_count' | 'streak' | 'level' | 'stat_total' | 'single_day_xp' | 'custom';
  target: number;
  statName?: string;
}

export interface UserAchievement {
  id: string;
  odeName: string;
  achievementId: string;
  unlockedAt: string;
  progress: number;
  isComplete: boolean;
}

// Rarity colors for UI
export const RARITY_COLORS: Record<AchievementRarity, { border: string; bg: string; text: string }> = {
  [AchievementRarity.COMMON]: { border: '#6b7280', bg: '#1f2937', text: '#9ca3af' },
  [AchievementRarity.UNCOMMON]: { border: '#22c55e', bg: '#14532d', text: '#4ade80' },
  [AchievementRarity.RARE]: { border: '#3b82f6', bg: '#1e3a8a', text: '#60a5fa' },
  [AchievementRarity.EPIC]: { border: '#a855f7', bg: '#581c87', text: '#c084fc' },
  [AchievementRarity.LEGENDARY]: { border: '#f59e0b', bg: '#78350f', text: '#fbbf24' },
};

// All achievements in the system
export const ACHIEVEMENTS: Achievement[] = [
  // Quest Achievements
  {
    id: 'first_quest',
    name: 'First Steps',
    description: 'Complete your first quest',
    icon: '🎯',
    category: AchievementCategory.QUESTS,
    rarity: AchievementRarity.COMMON,
    xpReward: 50,
    condition: { type: 'quest_count', target: 1 },
  },
  {
    id: 'quest_10',
    name: 'Getting Serious',
    description: 'Complete 10 quests',
    icon: '⚡',
    category: AchievementCategory.QUESTS,
    rarity: AchievementRarity.COMMON,
    xpReward: 100,
    condition: { type: 'quest_count', target: 10 },
  },
  {
    id: 'quest_50',
    name: 'Quest Slayer',
    description: 'Complete 50 quests',
    icon: '🗡️',
    category: AchievementCategory.QUESTS,
    rarity: AchievementRarity.UNCOMMON,
    xpReward: 250,
    condition: { type: 'quest_count', target: 50 },
  },
  {
    id: 'quest_100',
    name: 'Century Hunter',
    description: 'Complete 100 quests',
    icon: '💯',
    category: AchievementCategory.QUESTS,
    rarity: AchievementRarity.RARE,
    xpReward: 500,
    condition: { type: 'quest_count', target: 100 },
  },
  {
    id: 'quest_500',
    name: 'Quest Master',
    description: 'Complete 500 quests',
    icon: '🏆',
    category: AchievementCategory.QUESTS,
    rarity: AchievementRarity.EPIC,
    xpReward: 1000,
    condition: { type: 'quest_count', target: 500 },
  },
  {
    id: 'quest_1000',
    name: 'Legendary Hunter',
    description: 'Complete 1,000 quests',
    icon: '👑',
    category: AchievementCategory.QUESTS,
    rarity: AchievementRarity.LEGENDARY,
    xpReward: 2500,
    condition: { type: 'quest_count', target: 1000 },
  },

  // Streak Achievements
  {
    id: 'streak_3',
    name: 'Consistency Begins',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: AchievementCategory.STREAKS,
    rarity: AchievementRarity.COMMON,
    xpReward: 75,
    condition: { type: 'streak', target: 3 },
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: AchievementCategory.STREAKS,
    rarity: AchievementRarity.UNCOMMON,
    xpReward: 200,
    condition: { type: 'streak', target: 7 },
  },
  {
    id: 'streak_14',
    name: 'Fortnight Fighter',
    description: 'Maintain a 14-day streak',
    icon: '🔥',
    category: AchievementCategory.STREAKS,
    rarity: AchievementRarity.UNCOMMON,
    xpReward: 400,
    condition: { type: 'streak', target: 14 },
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    category: AchievementCategory.STREAKS,
    rarity: AchievementRarity.RARE,
    xpReward: 750,
    condition: { type: 'streak', target: 30 },
  },
  {
    id: 'streak_100',
    name: 'Centurion',
    description: 'Maintain a 100-day streak',
    icon: '💎',
    category: AchievementCategory.STREAKS,
    rarity: AchievementRarity.EPIC,
    xpReward: 2000,
    condition: { type: 'streak', target: 100 },
  },
  {
    id: 'streak_365',
    name: 'Year of Shadows',
    description: 'Maintain a 365-day streak',
    icon: '🌟',
    category: AchievementCategory.STREAKS,
    rarity: AchievementRarity.LEGENDARY,
    xpReward: 10000,
    condition: { type: 'streak', target: 365 },
  },

  // Level Achievements
  {
    id: 'level_5',
    name: 'Awakening',
    description: 'Reach Level 5',
    icon: '⬆️',
    category: AchievementCategory.LEVEL,
    rarity: AchievementRarity.COMMON,
    xpReward: 100,
    condition: { type: 'level', target: 5 },
  },
  {
    id: 'level_10',
    name: 'Double Digits',
    description: 'Reach Level 10',
    icon: '🔟',
    category: AchievementCategory.LEVEL,
    rarity: AchievementRarity.UNCOMMON,
    xpReward: 250,
    condition: { type: 'level', target: 10 },
  },
  {
    id: 'level_25',
    name: 'Quarter Century',
    description: 'Reach Level 25',
    icon: '⭐',
    category: AchievementCategory.LEVEL,
    rarity: AchievementRarity.RARE,
    xpReward: 500,
    condition: { type: 'level', target: 25 },
  },
  {
    id: 'level_50',
    name: 'Halfway There',
    description: 'Reach Level 50',
    icon: '🌟',
    category: AchievementCategory.LEVEL,
    rarity: AchievementRarity.EPIC,
    xpReward: 1000,
    condition: { type: 'level', target: 50 },
  },
  {
    id: 'level_100',
    name: 'Monarch',
    description: 'Reach Level 100',
    icon: '👑',
    category: AchievementCategory.LEVEL,
    rarity: AchievementRarity.LEGENDARY,
    xpReward: 5000,
    condition: { type: 'level', target: 100 },
  },

  // Special Achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a quest before 6 AM',
    icon: '🌅',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.UNCOMMON,
    xpReward: 150,
    condition: { type: 'custom', target: 1 },
    hidden: true,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a quest after midnight',
    icon: '🦉',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.UNCOMMON,
    xpReward: 150,
    condition: { type: 'custom', target: 1 },
    hidden: true,
  },
  {
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'Complete all daily quests in one day',
    icon: '✨',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.RARE,
    xpReward: 300,
    condition: { type: 'custom', target: 1 },
  },
  {
    id: 'comeback',
    name: 'The Comeback',
    description: 'Return after 7+ days of inactivity and complete a quest',
    icon: '🔄',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.RARE,
    xpReward: 200,
    condition: { type: 'custom', target: 1 },
    hidden: true,
  },
  {
    id: 'shadow_monarch',
    name: 'Shadow Monarch Awakening',
    description: 'Unlock the Necromancer class',
    icon: '🖤',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.LEGENDARY,
    xpReward: 5000,
    condition: { type: 'level', target: 50 },
    hidden: true,
  },
  {
    id: 'xp_500_day',
    name: 'XP Surge',
    description: 'Earn 500+ XP in a single day',
    icon: '⚡',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.RARE,
    xpReward: 250,
    condition: { type: 'single_day_xp', target: 500 },
  },
  {
    id: 'xp_1000_day',
    name: 'Power Overwhelming',
    description: 'Earn 1,000+ XP in a single day',
    icon: '💥',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.EPIC,
    xpReward: 500,
    condition: { type: 'single_day_xp', target: 1000 },
  },
];

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

/**
 * Get all achievements in a category
 */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

/**
 * Check if an achievement condition is met
 */
export function checkAchievementCondition(
  achievement: Achievement,
  stats: {
    questCount: number;
    currentStreak: number;
    level: number;
    dailyXp?: number;
  }
): boolean {
  const { condition } = achievement;
  
  switch (condition.type) {
    case 'quest_count':
      return stats.questCount >= condition.target;
    case 'streak':
      return stats.currentStreak >= condition.target;
    case 'level':
      return stats.level >= condition.target;
    case 'single_day_xp':
      return (stats.dailyXp || 0) >= condition.target;
    default:
      return false;
  }
}
