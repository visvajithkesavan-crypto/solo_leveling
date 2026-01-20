'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

interface StatusWindowData {
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  bestStreak: number;
  stats?: {
    strength?: number;
    agility?: number;
    intelligence?: number;
    vitality?: number;
  };
  recentChanges?: {
    strength?: number;
    agility?: number;
    intelligence?: number;
    vitality?: number;
  };
}

interface StatusWindowCardProps {
  data: StatusWindowData;
  userName?: string;
}

/**
 * Solo Leveling styled Status Window
 * Features: Animated XP bar, stat cards, streak display
 */
export function StatusWindowCard({ data, userName = 'HUNTER' }: StatusWindowCardProps) {
  const [showStatChanges, setShowStatChanges] = useState(false);
  
  // Animate XP value
  const animatedXP = useAnimatedValue(data.xp, 1000);
  
  // Calculate XP percentage
  const xpPercentage = useMemo(() => {
    return Math.min((animatedXP / data.xpToNext) * 100, 100);
  }, [animatedXP, data.xpToNext]);

  const isNearLevelUp = xpPercentage > 85;

  // Show stat changes briefly when they occur
  useEffect(() => {
    if (data.recentChanges && Object.values(data.recentChanges).some(v => v !== 0)) {
      setShowStatChanges(true);
      const timer = setTimeout(() => setShowStatChanges(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [data.recentChanges]);

  // Default stats if not provided
  const stats = data.stats || {
    strength: 10,
    agility: 10,
    intelligence: 10,
    vitality: 10,
  };

  const changes = data.recentChanges || {};

  return (
    <div className="status-window-card relative bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border-2 border-cyan-500/60 rounded-xl overflow-hidden shadow-status-window">
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-xl status-window-glow pointer-events-none" />
      
      {/* Corner accents */}
      <div className="absolute top-3 left-3 text-cyan-400 text-2xl opacity-70 status-corner-pulse">◈</div>
      <div className="absolute top-3 right-3 text-cyan-400 text-2xl opacity-70 status-corner-pulse">◈</div>
      <div className="absolute bottom-3 left-3 text-cyan-400 text-2xl opacity-70 status-corner-pulse">◈</div>
      <div className="absolute bottom-3 right-3 text-cyan-400 text-2xl opacity-70 status-corner-pulse">◈</div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="border-b border-cyan-500/30 pb-4 mb-6">
          <h2 className="text-2xl font-rajdhani font-bold text-cyan-400 tracking-widest text-center">
            ◈ HUNTER STATUS ◈
          </h2>
        </div>

        {/* Profile Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
            <div className="text-[10px] text-slate-500 font-mono tracking-widest mb-1">DESIGNATION</div>
            <div className="text-lg font-rajdhani font-bold text-yellow-400 truncate">
              {userName.toUpperCase()}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 text-center">
            <div className="text-[10px] text-slate-500 font-mono tracking-widest mb-1">LEVEL</div>
            <div className="text-4xl font-rajdhani font-bold text-cyan-400 level-glow">
              {data.level}
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-cyan-400/80 font-rajdhani tracking-widest">EXPERIENCE</span>
            <span className="text-yellow-400 font-mono">
              {animatedXP.toLocaleString()} / {data.xpToNext.toLocaleString()}
            </span>
          </div>
          <div className="relative h-7 bg-slate-900 border-2 border-cyan-500/40 rounded-lg overflow-hidden">
            {/* XP Fill */}
            <div
              className={`
                absolute inset-y-0 left-0
                bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-400
                transition-all duration-700 ease-out
                ${isNearLevelUp ? 'xp-bar-pulse' : ''}
              `}
              style={{ width: `${xpPercentage}%` }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20" />
              {/* Moving shine */}
              <div className="absolute inset-0 xp-shine" />
            </div>
            
            {/* Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-rajdhani font-bold text-white drop-shadow-lg tracking-wider">
                {xpPercentage.toFixed(1)}%
              </span>
            </div>

            {/* Near level-up indicator */}
            {isNearLevelUp && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <span className="text-yellow-400 text-xs font-bold animate-pulse">⚡ LEVEL UP SOON</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard 
            label="STR" 
            value={stats.strength || 0} 
            change={showStatChanges ? changes.strength : undefined}
            icon="💪"
          />
          <StatCard 
            label="AGI" 
            value={stats.agility || 0} 
            change={showStatChanges ? changes.agility : undefined}
            icon="⚡"
          />
          <StatCard 
            label="INT" 
            value={stats.intelligence || 0} 
            change={showStatChanges ? changes.intelligence : undefined}
            icon="🧠"
          />
          <StatCard 
            label="VIT" 
            value={stats.vitality || 0} 
            change={showStatChanges ? changes.vitality : undefined}
            icon="❤️"
          />
        </div>

        {/* Streak Display */}
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl streak-flame">🔥</span>
            <div>
              <div className="text-[10px] text-slate-500 font-mono tracking-widest">DAILY STREAK</div>
              <div className="text-2xl font-rajdhani font-bold text-orange-400">
                {data.streak} <span className="text-sm text-slate-500">DAYS</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-mono tracking-widest">RECORD</div>
            <div className="text-xl font-rajdhani font-bold text-yellow-400">
              {data.bestStreak}
            </div>
          </div>
        </div>
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none scan-lines opacity-30" />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  change?: number;
  icon?: string;
}

function StatCard({ label, value, change, icon }: StatCardProps) {
  const animatedValue = useAnimatedValue(value, 800);
  const hasChange = change !== undefined && change !== 0;
  const isPositive = change && change > 0;

  return (
    <div className="stat-card bg-slate-900/60 border border-cyan-500/30 rounded-lg p-3 hover:border-cyan-400/60 hover:bg-slate-800/60 transition-all duration-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-500 font-mono tracking-widest">{label}</span>
        {icon && <span className="text-sm opacity-60">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-rajdhani font-bold text-cyan-300">
          {animatedValue}
        </span>
        {hasChange && (
          <span 
            className={`
              text-sm font-mono font-bold stat-change-pop
              ${isPositive ? 'text-green-400' : 'text-red-400'}
            `}
          >
            ({isPositive ? '+' : ''}{change})
          </span>
        )}
      </div>
    </div>
  );
}

export default StatusWindowCard;
