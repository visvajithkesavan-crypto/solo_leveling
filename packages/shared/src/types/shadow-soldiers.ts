/**
 * Solo Leveling System - Shadow Soldiers
 * 
 * Shadow soldiers that users can unlock and level up
 */

export enum ShadowRank {
  NORMAL = 'normal',
  ELITE = 'elite',
  KNIGHT = 'knight',
  GENERAL = 'general',
  COMMANDER = 'commander',
}

export interface ShadowSoldier {
  id: string;
  name: string;
  title: string;
  rank: ShadowRank;
  icon: string;
  description: string;
  ability: string;
  abilityDescription: string;
  unlockCondition: ShadowUnlockCondition;
  baseStats: ShadowStats;
}

export interface ShadowStats {
  power: number;
  speed: number;
  loyalty: number;
}

export interface ShadowUnlockCondition {
  type: 'quest_streak' | 'level' | 'achievement' | 'special';
  target: number | string;
  description: string;
}

export interface UserShadow {
  odeName: string;
  oderId: string;
  shadowId: string;
  level: number;
  experience: number;
  customName?: string;
  unlockedAt: string;
  isActive: boolean;
}

// Rank colors for UI
export const SHADOW_RANK_COLORS: Record<ShadowRank, { border: string; glow: string }> = {
  [ShadowRank.NORMAL]: { border: '#6b7280', glow: '0 0 10px rgba(107, 114, 128, 0.5)' },
  [ShadowRank.ELITE]: { border: '#22c55e', glow: '0 0 15px rgba(34, 197, 94, 0.5)' },
  [ShadowRank.KNIGHT]: { border: '#3b82f6', glow: '0 0 20px rgba(59, 130, 246, 0.6)' },
  [ShadowRank.GENERAL]: { border: '#a855f7', glow: '0 0 25px rgba(168, 85, 247, 0.7)' },
  [ShadowRank.COMMANDER]: { border: '#ef4444', glow: '0 0 30px rgba(239, 68, 68, 0.8)' },
};

// All shadow soldiers
export const SHADOW_SOLDIERS: ShadowSoldier[] = [
  // Normal Rank - Early unlocks
  {
    id: 'iron_shadow',
    name: 'Iron',
    title: 'The Steadfast',
    rank: ShadowRank.NORMAL,
    icon: '🗡️',
    description: 'Your first shadow soldier. Born from your determination to begin this journey.',
    ability: 'Steady Progress',
    abilityDescription: '+5% XP from daily quests',
    unlockCondition: {
      type: 'quest_streak',
      target: 3,
      description: 'Maintain a 3-day quest streak',
    },
    baseStats: { power: 10, speed: 8, loyalty: 15 },
  },
  {
    id: 'tank_shadow',
    name: 'Tank',
    title: 'The Unyielding',
    rank: ShadowRank.NORMAL,
    icon: '🛡️',
    description: 'A defensive shadow that embodies your resilience.',
    ability: 'Damage Reduction',
    abilityDescription: '-10% streak penalty on missed days',
    unlockCondition: {
      type: 'quest_streak',
      target: 7,
      description: 'Maintain a 7-day quest streak',
    },
    baseStats: { power: 8, speed: 5, loyalty: 20 },
  },

  // Elite Rank - Medium unlocks
  {
    id: 'igris_shadow',
    name: 'Igris',
    title: 'Blood-Red Commander',
    rank: ShadowRank.ELITE,
    icon: '⚔️',
    description: 'A noble knight shadow. Represents your commitment to honor and discipline.',
    ability: 'Knight\'s Honor',
    abilityDescription: '+10% XP from workout quests',
    unlockCondition: {
      type: 'quest_streak',
      target: 14,
      description: 'Maintain a 14-day quest streak',
    },
    baseStats: { power: 25, speed: 20, loyalty: 30 },
  },
  {
    id: 'tusk_shadow',
    name: 'Tusk',
    title: 'The Beast',
    rank: ShadowRank.ELITE,
    icon: '🐗',
    description: 'A powerful beast shadow. Embodies raw strength.',
    ability: 'Beast Strength',
    abilityDescription: '+15% XP from strength-type quests',
    unlockCondition: {
      type: 'level',
      target: 15,
      description: 'Reach Level 15',
    },
    baseStats: { power: 35, speed: 15, loyalty: 20 },
  },

  // Knight Rank - Advanced unlocks
  {
    id: 'beru_shadow',
    name: 'Beru',
    title: 'Ant King',
    rank: ShadowRank.KNIGHT,
    icon: '🐜',
    description: 'The former Ant King. Extremely powerful and loyal.',
    ability: 'Regeneration',
    abilityDescription: 'Restore 1 streak day once per week',
    unlockCondition: {
      type: 'quest_streak',
      target: 30,
      description: 'Maintain a 30-day quest streak',
    },
    baseStats: { power: 50, speed: 45, loyalty: 25 },
  },
  {
    id: 'greed_shadow',
    name: 'Greed',
    title: 'The Hungry',
    rank: ShadowRank.KNIGHT,
    icon: '👹',
    description: 'A demon shadow with insatiable hunger for XP.',
    ability: 'XP Hunger',
    abilityDescription: '+20% XP from all quests (stacks with class bonus)',
    unlockCondition: {
      type: 'level',
      target: 25,
      description: 'Reach Level 25',
    },
    baseStats: { power: 40, speed: 35, loyalty: 20 },
  },

  // General Rank - Expert unlocks
  {
    id: 'bellion_shadow',
    name: 'Bellion',
    title: 'Grand Marshal',
    rank: ShadowRank.GENERAL,
    icon: '👑',
    description: 'The Grand Marshal of shadows. Leads all other shadows.',
    ability: 'Grand Command',
    abilityDescription: 'All shadow abilities +50% effectiveness',
    unlockCondition: {
      type: 'quest_streak',
      target: 60,
      description: 'Maintain a 60-day quest streak',
    },
    baseStats: { power: 70, speed: 65, loyalty: 40 },
  },

  // Commander Rank - Legendary unlocks
  {
    id: 'kaisel_shadow',
    name: 'Kaisel',
    title: 'Shadow Dragon',
    rank: ShadowRank.COMMANDER,
    icon: '🐉',
    description: 'The ultimate shadow mount. Represents mastery over your journey.',
    ability: 'Dragon\'s Flight',
    abilityDescription: '+50% XP from all sources, +1 daily quest slot',
    unlockCondition: {
      type: 'level',
      target: 50,
      description: 'Reach Level 50',
    },
    baseStats: { power: 100, speed: 100, loyalty: 50 },
  },
];

/**
 * Get shadow soldier by ID
 */
export function getShadowById(id: string): ShadowSoldier | undefined {
  return SHADOW_SOLDIERS.find(s => s.id === id);
}

/**
 * Get all shadows of a specific rank
 */
export function getShadowsByRank(rank: ShadowRank): ShadowSoldier[] {
  return SHADOW_SOLDIERS.filter(s => s.rank === rank);
}

/**
 * Check if user can unlock a shadow
 */
export function canUnlockShadow(
  shadow: ShadowSoldier,
  stats: { questStreak: number; level: number; achievements: string[] }
): boolean {
  const { unlockCondition } = shadow;
  
  switch (unlockCondition.type) {
    case 'quest_streak':
      return stats.questStreak >= (unlockCondition.target as number);
    case 'level':
      return stats.level >= (unlockCondition.target as number);
    case 'achievement':
      return stats.achievements.includes(unlockCondition.target as string);
    default:
      return false;
  }
}

/**
 * Calculate total XP bonus from active shadows
 */
export function calculateShadowXpBonus(activeShadows: UserShadow[]): number {
  // Base implementation - would be enhanced with actual shadow abilities
  return activeShadows.length * 0.02; // 2% per active shadow
}
