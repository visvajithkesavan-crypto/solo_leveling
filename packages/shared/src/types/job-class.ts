/**
 * Solo Leveling System - Job Class Types
 * 
 * Hunter job classes inspired by Solo Leveling manhwa
 */

export enum JobClass {
  NONE = 'none',
  FIGHTER = 'fighter',
  MAGE = 'mage',
  ASSASSIN = 'assassin',
  HEALER = 'healer',
  TANK = 'tank',
  NECROMANCER = 'necromancer', // Special class (unlockable)
}

export interface JobClassInfo {
  id: JobClass;
  name: string;
  title: string;
  description: string;
  icon: string;
  primaryStat: 'strength' | 'intelligence' | 'agility' | 'vitality';
  bonusMultiplier: number; // XP bonus for class-aligned quests
  unlockLevel: number;
  color: string;
  questTypes: string[]; // Types of quests this class excels at
}

export const JOB_CLASSES: Record<JobClass, JobClassInfo> = {
  [JobClass.NONE]: {
    id: JobClass.NONE,
    name: 'Unawakened',
    title: 'E-Rank Hunter',
    description: 'You have not yet awakened your true power. Complete the Job Change Quest to unlock your class.',
    icon: '◇',
    primaryStat: 'strength',
    bonusMultiplier: 1.0,
    unlockLevel: 1,
    color: '#6b7280',
    questTypes: ['any'],
  },
  [JobClass.FIGHTER]: {
    id: JobClass.FIGHTER,
    name: 'Fighter',
    title: 'Strength-Type Hunter',
    description: 'Masters of physical combat. Excel at strength and endurance training.',
    icon: '⚔️',
    primaryStat: 'strength',
    bonusMultiplier: 1.5,
    unlockLevel: 10,
    color: '#ef4444',
    questTypes: ['workout', 'strength', 'endurance', 'sports'],
  },
  [JobClass.MAGE]: {
    id: JobClass.MAGE,
    name: 'Mage',
    title: 'Intelligence-Type Hunter',
    description: 'Wielders of arcane knowledge. Excel at learning and mental challenges.',
    icon: '🔮',
    primaryStat: 'intelligence',
    bonusMultiplier: 1.5,
    unlockLevel: 10,
    color: '#8b5cf6',
    questTypes: ['study', 'reading', 'learning', 'meditation', 'coding'],
  },
  [JobClass.ASSASSIN]: {
    id: JobClass.ASSASSIN,
    name: 'Assassin',
    title: 'Agility-Type Hunter',
    description: 'Swift and precise. Excel at speed, flexibility, and time-sensitive tasks.',
    icon: '🗡️',
    primaryStat: 'agility',
    bonusMultiplier: 1.5,
    unlockLevel: 10,
    color: '#14b8a6',
    questTypes: ['running', 'cardio', 'flexibility', 'quick-tasks'],
  },
  [JobClass.HEALER]: {
    id: JobClass.HEALER,
    name: 'Healer',
    title: 'Recovery-Type Hunter',
    description: 'Masters of restoration. Excel at health, wellness, and self-care.',
    icon: '💚',
    primaryStat: 'vitality',
    bonusMultiplier: 1.5,
    unlockLevel: 10,
    color: '#22c55e',
    questTypes: ['sleep', 'nutrition', 'hydration', 'rest', 'wellness'],
  },
  [JobClass.TANK]: {
    id: JobClass.TANK,
    name: 'Tank',
    title: 'Defense-Type Hunter',
    description: 'Unyielding defenders. Excel at endurance, discipline, and consistency.',
    icon: '🛡️',
    primaryStat: 'vitality',
    bonusMultiplier: 1.5,
    unlockLevel: 10,
    color: '#f59e0b',
    questTypes: ['discipline', 'habit', 'consistency', 'endurance'],
  },
  [JobClass.NECROMANCER]: {
    id: JobClass.NECROMANCER,
    name: 'Shadow Monarch',
    title: 'Ruler of Shadows',
    description: 'The rarest class. Command shadow soldiers and gain bonus XP from all quest types.',
    icon: '👑',
    primaryStat: 'intelligence',
    bonusMultiplier: 2.0,
    unlockLevel: 50,
    color: '#6366f1',
    questTypes: ['any'],
  },
};

export interface UserJobClass {
  userId: string;
  jobClass: JobClass;
  unlockedAt: string;
  totalClassXp: number;
  classLevel: number;
}

/**
 * Calculate XP bonus based on job class and quest type
 */
export function calculateClassBonus(
  jobClass: JobClass,
  questType: string,
  baseXp: number
): number {
  const classInfo = JOB_CLASSES[jobClass];
  
  if (classInfo.questTypes.includes('any') || classInfo.questTypes.includes(questType)) {
    return Math.floor(baseXp * classInfo.bonusMultiplier);
  }
  
  return baseXp;
}

/**
 * Check if a user can unlock a specific class
 */
export function canUnlockClass(level: number, targetClass: JobClass): boolean {
  return level >= JOB_CLASSES[targetClass].unlockLevel;
}
