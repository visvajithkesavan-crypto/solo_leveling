'use client';

import React from 'react';
import {
  Achievement,
  AchievementCategory,
  AchievementRarity,
  ACHIEVEMENTS,
  RARITY_COLORS,
  checkAchievementCondition,
} from '@solo-leveling/shared';

interface AchievementsPanelProps {
  userAchievements: string[]; // Array of unlocked achievement IDs
  stats: {
    questCount: number;
    currentStreak: number;
    level: number;
    dailyXp?: number;
  };
  onClose?: () => void;
}

export function AchievementsPanel({
  userAchievements,
  stats,
  onClose,
}: AchievementsPanelProps) {
  const categories = Object.values(AchievementCategory);
  
  const getProgress = (achievement: Achievement): number => {
    const { condition } = achievement;
    let current = 0;
    
    switch (condition.type) {
      case 'quest_count':
        current = stats.questCount;
        break;
      case 'streak':
        current = stats.currentStreak;
        break;
      case 'level':
        current = stats.level;
        break;
      case 'single_day_xp':
        current = stats.dailyXp || 0;
        break;
    }
    
    return Math.min(100, (current / condition.target) * 100);
  };

  const isUnlocked = (id: string) => userAchievements.includes(id);

  const renderAchievement = (achievement: Achievement) => {
    const unlocked = isUnlocked(achievement.id);
    const progress = getProgress(achievement);
    const colors = RARITY_COLORS[achievement.rarity];
    
    // Hide secret achievements that aren't unlocked
    if (achievement.hidden && !unlocked) {
      return (
        <div
          key={achievement.id}
          className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/50"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl opacity-30">❓</span>
            <div>
              <div className="text-slate-500 font-bold">???</div>
              <div className="text-xs text-slate-600">Secret Achievement</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={achievement.id}
        className={`relative p-4 rounded-lg border-2 transition-all duration-300
          ${unlocked 
            ? 'shadow-lg' 
            : 'opacity-70 grayscale hover:opacity-90 hover:grayscale-0'
          }
        `}
        style={{
          borderColor: unlocked ? colors.border : '#374151',
          backgroundColor: unlocked ? colors.bg : '#1f2937',
          boxShadow: unlocked ? `0 0 20px ${colors.border}40` : 'none',
        }}
      >
        {/* Rarity badge */}
        <div 
          className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold uppercase"
          style={{ 
            backgroundColor: `${colors.border}20`,
            color: colors.text,
          }}
        >
          {achievement.rarity}
        </div>

        {/* Icon and title */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{achievement.icon}</span>
          <div>
            <div 
              className="font-rajdhani font-bold text-lg"
              style={{ color: unlocked ? colors.text : '#9ca3af' }}
            >
              {achievement.name}
            </div>
            <div className="text-xs text-slate-400">
              {achievement.description}
            </div>
          </div>
        </div>

        {/* Progress bar (if not unlocked) */}
        {!unlocked && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: colors.border,
                }}
              />
            </div>
          </div>
        )}

        {/* XP reward */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Reward: <span className="text-yellow-400">+{achievement.xpReward} XP</span>
          </span>
          {unlocked && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              ✓ Unlocked
            </span>
          )}
        </div>
      </div>
    );
  };

  const getCategoryIcon = (category: AchievementCategory): string => {
    switch (category) {
      case AchievementCategory.QUESTS: return '🎯';
      case AchievementCategory.STREAKS: return '🔥';
      case AchievementCategory.LEVEL: return '⬆️';
      case AchievementCategory.STATS: return '📊';
      case AchievementCategory.SPECIAL: return '✨';
      default: return '◇';
    }
  };

  const getCategoryName = (category: AchievementCategory): string => {
    switch (category) {
      case AchievementCategory.QUESTS: return 'Quest Achievements';
      case AchievementCategory.STREAKS: return 'Streak Achievements';
      case AchievementCategory.LEVEL: return 'Level Achievements';
      case AchievementCategory.STATS: return 'Stat Achievements';
      case AchievementCategory.SPECIAL: return 'Special Achievements';
      default: return 'Achievements';
    }
  };

  // Count unlocked achievements
  const unlockedCount = ACHIEVEMENTS.filter(a => isUnlocked(a.id)).length;
  const totalCount = ACHIEVEMENTS.filter(a => !a.hidden).length;

  return (
    <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/30 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-rajdhani font-bold text-cyan-400 tracking-wider">
            ◇ ACHIEVEMENTS ◇
          </h2>
          <p className="text-slate-400 text-sm">
            {unlockedCount} / {totalCount} Unlocked
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Progress overview */}
      <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Overall Progress</span>
          <span>{Math.round((unlockedCount / totalCount) * 100)}%</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryAchievements = ACHIEVEMENTS.filter(
            a => a.category === category
          );
          
          if (categoryAchievements.length === 0) return null;

          const categoryUnlocked = categoryAchievements.filter(a => isUnlocked(a.id)).length;

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{getCategoryIcon(category)}</span>
                <h3 className="text-lg font-rajdhani font-bold text-white">
                  {getCategoryName(category)}
                </h3>
                <span className="text-sm text-slate-500">
                  ({categoryUnlocked}/{categoryAchievements.length})
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryAchievements.map(renderAchievement)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
