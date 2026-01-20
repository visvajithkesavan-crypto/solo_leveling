'use client';

import React from 'react';
import {
  ShadowSoldier,
  ShadowRank,
  SHADOW_SOLDIERS,
  SHADOW_RANK_COLORS,
  UserShadow,
  canUnlockShadow,
} from '@solo-leveling/shared';

interface ShadowArmyPanelProps {
  userShadows: UserShadow[];
  stats: {
    questStreak: number;
    level: number;
    achievements: string[];
  };
  onActivateShadow?: (shadowId: string) => void;
  onClose?: () => void;
}

export function ShadowArmyPanel({
  userShadows,
  stats,
  onActivateShadow,
  onClose,
}: ShadowArmyPanelProps) {
  const ranks = Object.values(ShadowRank);

  const isUnlocked = (shadowId: string): boolean => {
    return userShadows.some(s => s.shadowId === shadowId);
  };

  const getUserShadow = (shadowId: string): UserShadow | undefined => {
    return userShadows.find(s => s.shadowId === shadowId);
  };

  const canUnlock = (shadow: ShadowSoldier): boolean => {
    return canUnlockShadow(shadow, stats);
  };

  const getUnlockProgress = (shadow: ShadowSoldier): number => {
    const { unlockCondition } = shadow;
    let current = 0;
    let target = unlockCondition.target as number;

    switch (unlockCondition.type) {
      case 'quest_streak':
        current = stats.questStreak;
        break;
      case 'level':
        current = stats.level;
        break;
      case 'achievement':
        current = stats.achievements.includes(unlockCondition.target as string) ? 1 : 0;
        target = 1;
        break;
    }

    return Math.min(100, (current / target) * 100);
  };

  const renderShadow = (shadow: ShadowSoldier) => {
    const unlocked = isUnlocked(shadow.id);
    const userShadow = getUserShadow(shadow.id);
    const available = canUnlock(shadow);
    const progress = getUnlockProgress(shadow);
    const colors = SHADOW_RANK_COLORS[shadow.rank];

    return (
      <div
        key={shadow.id}
        className={`relative p-4 rounded-lg border-2 transition-all duration-300
          ${unlocked 
            ? 'hover:scale-105' 
            : available
              ? 'opacity-90 hover:opacity-100'
              : 'opacity-50 grayscale'
          }
        `}
        style={{
          borderColor: unlocked ? colors.border : available ? colors.border + '80' : '#374151',
          backgroundColor: unlocked ? '#1e293b' : '#0f172a',
          boxShadow: unlocked ? colors.glow : 'none',
        }}
      >
        {/* Rank badge */}
        <div 
          className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold uppercase"
          style={{ 
            backgroundColor: `${colors.border}20`,
            color: colors.border,
          }}
        >
          {shadow.rank}
        </div>

        {/* Icon and name */}
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-12 h-12 flex items-center justify-center text-3xl rounded-full"
            style={{
              backgroundColor: `${colors.border}20`,
              boxShadow: unlocked ? colors.glow : 'none',
            }}
          >
            {shadow.icon}
          </div>
          <div>
            <div 
              className="font-rajdhani font-bold text-lg"
              style={{ color: unlocked ? colors.border : '#9ca3af' }}
            >
              {userShadow?.customName || shadow.name}
            </div>
            <div className="text-xs text-slate-500">{shadow.title}</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-3">
          {shadow.description}
        </p>

        {/* Ability */}
        <div className="p-2 bg-slate-800/50 rounded mb-3">
          <div className="text-xs text-cyan-400 mb-1">{shadow.ability}</div>
          <div className="text-xs text-slate-300">{shadow.abilityDescription}</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-slate-900/50 rounded">
            <div className="text-xs text-slate-500">PWR</div>
            <div className="text-sm text-red-400 font-bold">{shadow.baseStats.power}</div>
          </div>
          <div className="text-center p-2 bg-slate-900/50 rounded">
            <div className="text-xs text-slate-500">SPD</div>
            <div className="text-sm text-green-400 font-bold">{shadow.baseStats.speed}</div>
          </div>
          <div className="text-center p-2 bg-slate-900/50 rounded">
            <div className="text-xs text-slate-500">LOY</div>
            <div className="text-sm text-blue-400 font-bold">{shadow.baseStats.loyalty}</div>
          </div>
        </div>

        {/* Unlock status / Progress */}
        {unlocked ? (
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Level: <span className="text-cyan-400">{userShadow?.level || 1}</span>
            </div>
            <button
              onClick={() => onActivateShadow?.(shadow.id)}
              className={`px-3 py-1 text-xs font-bold rounded transition-all
                ${userShadow?.isActive
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
            >
              {userShadow?.isActive ? '✓ ACTIVE' : 'ACTIVATE'}
            </button>
          </div>
        ) : available ? (
          <div>
            <div className="text-xs text-yellow-400 mb-2 text-center animate-pulse">
              ◇ Ready to Extract ◇
            </div>
            <button
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
              ARISE
            </button>
          </div>
        ) : (
          <div>
            <div className="text-xs text-slate-500 mb-1">
              🔒 {shadow.unlockCondition.description}
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
            <div className="text-xs text-slate-600 text-right mt-1">
              {Math.round(progress)}%
            </div>
          </div>
        )}
      </div>
    );
  };

  const getRankIcon = (rank: ShadowRank): string => {
    switch (rank) {
      case ShadowRank.NORMAL: return '◇';
      case ShadowRank.ELITE: return '◆';
      case ShadowRank.KNIGHT: return '⬧';
      case ShadowRank.GENERAL: return '★';
      case ShadowRank.COMMANDER: return '♛';
      default: return '◇';
    }
  };

  // Count shadows
  const unlockedCount = userShadows.length;
  const totalCount = SHADOW_SOLDIERS.length;

  return (
    <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-purple-500/30 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-rajdhani font-bold text-purple-400 tracking-wider">
            ◇ SHADOW ARMY ◇
          </h2>
          <p className="text-slate-400 text-sm">
            {unlockedCount} / {totalCount} Shadows Extracted
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

      {/* Active shadows summary */}
      {userShadows.filter(s => s.isActive).length > 0 && (
        <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
          <div className="text-sm text-purple-400 mb-2">Active Shadows</div>
          <div className="flex flex-wrap gap-2">
            {userShadows.filter(s => s.isActive).map(us => {
              const shadow = SHADOW_SOLDIERS.find(s => s.id === us.shadowId);
              if (!shadow) return null;
              return (
                <div 
                  key={us.shadowId}
                  className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full"
                >
                  <span>{shadow.icon}</span>
                  <span className="text-sm text-white">{us.customName || shadow.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shadows by rank */}
      <div className="space-y-8">
        {ranks.map((rank) => {
          const rankShadows = SHADOW_SOLDIERS.filter(s => s.rank === rank);
          if (rankShadows.length === 0) return null;

          const colors = SHADOW_RANK_COLORS[rank];
          const rankUnlocked = rankShadows.filter(s => isUnlocked(s.id)).length;

          return (
            <div key={rank}>
              <div className="flex items-center gap-2 mb-4">
                <span 
                  className="text-xl"
                  style={{ color: colors.border }}
                >
                  {getRankIcon(rank)}
                </span>
                <h3 
                  className="text-lg font-rajdhani font-bold uppercase"
                  style={{ color: colors.border }}
                >
                  {rank} Rank
                </h3>
                <span className="text-sm text-slate-500">
                  ({rankUnlocked}/{rankShadows.length})
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rankShadows.map(renderShadow)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
