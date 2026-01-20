'use client';

import React, { useState } from 'react';
import { QuestCard } from '@/components/QuestCard';
import { StatusWindowCard } from '@/components/StatusWindowCard';
import { LevelUpCinematic } from '@/components/LevelUpCinematic';
import { useFloatingXP } from '@/components/FloatingXP';
import { Goal, QuestStatus, QuestDifficulty } from '@solo-leveling/shared';

/**
 * Visual Components Test Page
 * 
 * Test all visual components and animations
 * Access at: /test-visuals
 */
export default function TestVisualsPage() {
  const { showFloatingXP } = useFloatingXP();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(42);
  const [xpValue, setXpValue] = useState(7500);

  // Sample quest data
  const sampleQuests: Goal[] = [
    {
      id: '1',
      user_id: 'test',
      title: 'Complete 100 Pushups',
      description: 'Daily physical training to increase base strength stat. Execute with proper form.',
      difficulty: QuestDifficulty.C_RANK,
      created_at: new Date().toISOString(),
      status: QuestStatus.ACTIVE,
      xp_reward: 50,
      progress: 60,
      target: 100,
    },
    {
      id: '2',
      user_id: 'test',
      title: 'Read for 30 Minutes',
      description: 'Mental training exercise. Absorb knowledge to enhance intelligence.',
      difficulty: QuestDifficulty.E_RANK,
      created_at: new Date().toISOString(),
      status: QuestStatus.ACTIVE,
      xp_reward: 30,
    },
    {
      id: '3',
      user_id: 'test',
      title: 'Run 10 Kilometers',
      description: 'Endurance training. Push beyond your limits.',
      difficulty: QuestDifficulty.B_RANK,
      created_at: new Date().toISOString(),
      status: QuestStatus.ACTIVE,
      xp_reward: 100,
      progress: 3,
      target: 10,
    },
    {
      id: '4',
      user_id: 'test',
      title: 'Clear S-Rank Dungeon',
      description: 'Ultimate challenge. Only the strongest hunters may attempt.',
      difficulty: QuestDifficulty.S_RANK,
      created_at: new Date().toISOString(),
      status: QuestStatus.ACTIVE,
      xp_reward: 500,
    },
  ];

  // Sample status window data
  const sampleStatus = {
    level: 42,
    xp: xpValue,
    xpToNext: 10000,
    streak: 14,
    bestStreak: 30,
    stats: {
      strength: 156,
      agility: 142,
      intelligence: 138,
      vitality: 150,
    },
    recentChanges: {
      strength: 2,
      agility: 1,
      intelligence: 3,
      vitality: 2,
    },
  };

  const handleComplete = (id: string) => {
    const element = document.getElementById(`quest-${id}`);
    showFloatingXP(50, element);
  };

  const handleDelete = (id: string) => {
    console.log('Delete quest:', id);
  };

  const triggerFloatingXP = (e: React.MouseEvent) => {
    showFloatingXP(100, e.currentTarget as HTMLElement);
  };

  const addXP = () => {
    setXpValue(prev => Math.min(prev + 500, 10000));
  };

  return (
    <div className="min-h-screen bg-system-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-rajdhani font-bold text-cyan-400 tracking-widest mb-2">
            ◈ VISUAL TEST INTERFACE ◈
          </h1>
          <p className="text-slate-400">
            Test all visual components and animations
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button
            onClick={() => {
              setLevelUpLevel(prev => prev + 1);
              setShowLevelUp(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-2 border-cyan-500 text-cyan-400 font-rajdhani font-bold rounded-lg tracking-wider hover:border-cyan-400 hover:shadow-button-cyan transition-all"
          >
            ◇ TRIGGER LEVEL UP
          </button>
          
          <button
            onClick={triggerFloatingXP}
            className="px-6 py-3 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-2 border-yellow-500 text-yellow-400 font-rajdhani font-bold rounded-lg tracking-wider hover:border-yellow-400 transition-all"
          >
            ◇ FLOATING +100 XP
          </button>

          <button
            onClick={addXP}
            className="px-6 py-3 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-2 border-green-500 text-green-400 font-rajdhani font-bold rounded-lg tracking-wider hover:border-green-400 transition-all"
          >
            ◇ ADD 500 XP
          </button>
        </div>

        {/* Status Window Test */}
        <div className="mb-12">
          <h2 className="text-2xl font-rajdhani font-bold text-cyan-400 mb-6 tracking-wider">
            ◇ STATUS WINDOW CARD
          </h2>
          <div className="max-w-md">
            <StatusWindowCard data={sampleStatus} userName="SUNG JINWOO" />
          </div>
        </div>

        {/* Quest Cards Test */}
        <div className="mb-12">
          <h2 className="text-2xl font-rajdhani font-bold text-cyan-400 mb-6 tracking-wider">
            ◇ QUEST CARDS (Hover to see effects)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {sampleQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                goal={quest}
                onComplete={handleComplete}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        {/* Difficulty Legend */}
        <div className="mb-12 p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg">
          <h2 className="text-xl font-rajdhani font-bold text-cyan-400 mb-4 tracking-wider">
            ◇ DIFFICULTY RANKS
          </h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-green-900/30 border border-green-500/50 text-green-400 font-bold rounded">E</span>
              <span className="text-slate-400">Easy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-cyan-900/30 border border-cyan-500/50 text-cyan-400 font-bold rounded">D</span>
              <span className="text-slate-400">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-orange-900/30 border border-orange-500/50 text-orange-400 font-bold rounded">B</span>
              <span className="text-slate-400">Hard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-red-900/30 border border-red-500/50 text-red-400 font-bold rounded">S</span>
              <span className="text-slate-400">Extreme</span>
            </div>
          </div>
        </div>

        {/* Animation Showcase */}
        <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg">
          <h2 className="text-xl font-rajdhani font-bold text-cyan-400 mb-4 tracking-wider">
            ◇ ANIMATIONS SHOWCASE
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/50 rounded text-center">
              <div className="text-3xl quest-corner-glow mb-2">◈</div>
              <div className="text-xs text-slate-500">Corner Pulse</div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded text-center">
              <div className="text-3xl streak-flame mb-2">🔥</div>
              <div className="text-xs text-slate-500">Streak Flame</div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded text-center">
              <div className="text-3xl level-up-sparkle mb-2">✦</div>
              <div className="text-xs text-slate-500">Level Sparkle</div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded text-center">
              <div className="text-3xl level-glow text-cyan-400 mb-2">42</div>
              <div className="text-xs text-slate-500">Level Glow</div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Up Cinematic */}
      {showLevelUp && (
        <LevelUpCinematic
          level={levelUpLevel}
          statIncreases={{
            STR: 5,
            AGI: 4,
            INT: 3,
            VIT: 5,
          }}
          onClose={() => setShowLevelUp(false)}
          autoCloseDelay={5000}
        />
      )}
    </div>
  );
}
