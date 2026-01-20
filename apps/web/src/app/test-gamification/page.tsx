'use client';

import React, { useState } from 'react';
import { JobClass, JOB_CLASSES, ACHIEVEMENTS, SHADOW_SOLDIERS, ShadowRank } from '@solo-leveling/shared';
import { JobClassSelection } from '@/components/JobClassSelection';
import { AchievementsPanel } from '@/components/AchievementsPanel';
import { ShadowArmyPanel } from '@/components/ShadowArmyPanel';
import { playSound } from '@/lib/sounds';

/**
 * Gamification Features Test Page
 * 
 * Test all gamification features
 * Access at: /test-gamification
 */
export default function TestGamificationPage() {
  // User state (simulated)
  const [level, setLevel] = useState(25);
  const [jobClass, setJobClass] = useState<JobClass>(JobClass.NONE);
  const [questStreak, setQuestStreak] = useState(14);
  const [questCount, setQuestCount] = useState(45);
  
  // UI state
  const [showJobSelection, setShowJobSelection] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'shadows'>('overview');
  
  // Simulated unlocked achievements
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([
    'first_quest',
    'quest_10',
    'streak_3',
    'streak_7',
    'level_5',
    'level_10',
  ]);
  
  // Simulated shadow army
  const [userShadows, setUserShadows] = useState([
    { odeName: 'user1', oderId: '1', shadowId: 'iron_shadow', level: 3, experience: 150, unlockedAt: new Date().toISOString(), isActive: true },
    { odeName: 'user1', oderId: '2', shadowId: 'tank_shadow', level: 2, experience: 80, unlockedAt: new Date().toISOString(), isActive: false },
  ]);

  const handleSelectClass = (selectedClass: JobClass) => {
    setJobClass(selectedClass);
    setShowJobSelection(false);
    playSound('levelup');
  };

  const handleUnlockAchievement = (achievementId: string) => {
    if (!unlockedAchievements.includes(achievementId)) {
      setUnlockedAchievements([...unlockedAchievements, achievementId]);
      playSound('complete');
    }
  };

  const handleActivateShadow = (shadowId: string) => {
    setUserShadows(prev => prev.map(s => ({
      ...s,
      isActive: s.shadowId === shadowId ? !s.isActive : s.isActive,
    })));
    playSound('notification');
  };

  const stats = {
    questCount,
    currentStreak: questStreak,
    level,
    dailyXp: 320,
  };

  const shadowStats = {
    questStreak,
    level,
    achievements: unlockedAchievements,
  };

  const currentClassInfo = JOB_CLASSES[jobClass];

  return (
    <div className="min-h-screen bg-system-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-rajdhani font-bold text-cyan-400 tracking-widest mb-2">
            ◈ GAMIFICATION TEST ◈
          </h1>
          <p className="text-slate-400">
            Test Job Classes, Achievements, and Shadow Army features
          </p>
        </div>

        {/* User Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-center">
            <div className="text-sm text-slate-500">Level</div>
            <div className="text-3xl font-rajdhani font-bold text-cyan-400">{level}</div>
            <div className="flex gap-2 mt-2 justify-center">
              <button 
                onClick={() => setLevel(Math.max(1, level - 5))}
                className="px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600"
              >
                -5
              </button>
              <button 
                onClick={() => setLevel(level + 5)}
                className="px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600"
              >
                +5
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-slate-800/50 border border-orange-500/30 rounded-lg text-center">
            <div className="text-sm text-slate-500">Streak</div>
            <div className="text-3xl font-rajdhani font-bold text-orange-400">🔥 {questStreak}</div>
            <div className="flex gap-2 mt-2 justify-center">
              <button 
                onClick={() => setQuestStreak(Math.max(0, questStreak - 7))}
                className="px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600"
              >
                -7
              </button>
              <button 
                onClick={() => setQuestStreak(questStreak + 7)}
                className="px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600"
              >
                +7
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-slate-800/50 border border-green-500/30 rounded-lg text-center">
            <div className="text-sm text-slate-500">Quests Done</div>
            <div className="text-3xl font-rajdhani font-bold text-green-400">{questCount}</div>
            <div className="flex gap-2 mt-2 justify-center">
              <button 
                onClick={() => setQuestCount(Math.max(0, questCount - 10))}
                className="px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600"
              >
                -10
              </button>
              <button 
                onClick={() => setQuestCount(questCount + 10)}
                className="px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600"
              >
                +10
              </button>
            </div>
          </div>
          
          <div 
            className="p-4 bg-slate-800/50 border rounded-lg text-center cursor-pointer hover:border-opacity-100 transition-all"
            style={{ borderColor: currentClassInfo.color + '80' }}
            onClick={() => setShowJobSelection(true)}
          >
            <div className="text-sm text-slate-500">Job Class</div>
            <div className="text-2xl mb-1">{currentClassInfo.icon}</div>
            <div 
              className="font-rajdhani font-bold"
              style={{ color: currentClassInfo.color }}
            >
              {currentClassInfo.name}
            </div>
            <div className="text-xs text-slate-500 mt-1">Click to change</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-rajdhani font-bold rounded-t transition-all
              ${activeTab === 'overview' 
                ? 'bg-cyan-900/50 border-b-2 border-cyan-400 text-cyan-400' 
                : 'text-slate-500 hover:text-white'
              }
            `}
          >
            ◇ OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 font-rajdhani font-bold rounded-t transition-all
              ${activeTab === 'achievements' 
                ? 'bg-yellow-900/50 border-b-2 border-yellow-400 text-yellow-400' 
                : 'text-slate-500 hover:text-white'
              }
            `}
          >
            🏆 ACHIEVEMENTS ({unlockedAchievements.length}/{ACHIEVEMENTS.filter(a => !a.hidden).length})
          </button>
          <button
            onClick={() => setActiveTab('shadows')}
            className={`px-4 py-2 font-rajdhani font-bold rounded-t transition-all
              ${activeTab === 'shadows' 
                ? 'bg-purple-900/50 border-b-2 border-purple-400 text-purple-400' 
                : 'text-slate-500 hover:text-white'
              }
            `}
          >
            👥 SHADOW ARMY ({userShadows.length}/{SHADOW_SOLDIERS.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Job Class Section */}
            <div className="p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg">
              <h2 className="text-xl font-rajdhani font-bold text-cyan-400 mb-4">
                ◇ JOB CLASS SYSTEM
              </h2>
              
              {jobClass === JobClass.NONE ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">◇</div>
                  <p className="text-slate-400 mb-4">
                    You have not yet awakened your true power.
                  </p>
                  <button
                    onClick={() => setShowJobSelection(true)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-2 border-cyan-500 text-cyan-400 font-rajdhani font-bold rounded-lg tracking-wider hover:border-cyan-400 hover:shadow-button-cyan transition-all"
                  >
                    ◇ BEGIN JOB CHANGE QUEST ◇
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div 
                    className="p-4 rounded-lg border-2"
                    style={{ 
                      borderColor: currentClassInfo.color,
                      backgroundColor: currentClassInfo.color + '10',
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-5xl">{currentClassInfo.icon}</span>
                      <div>
                        <div 
                          className="text-2xl font-rajdhani font-bold"
                          style={{ color: currentClassInfo.color }}
                        >
                          {currentClassInfo.name}
                        </div>
                        <div className="text-slate-400">{currentClassInfo.title}</div>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-4">{currentClassInfo.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Primary Stat: </span>
                        <span className="text-cyan-400 uppercase">{currentClassInfo.primaryStat}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">XP Bonus: </span>
                        <span className="text-green-400">+{Math.round((currentClassInfo.bonusMultiplier - 1) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <div className="text-sm text-slate-500 mb-2">Bonus Quest Types</div>
                    <div className="flex flex-wrap gap-2">
                      {currentClassInfo.questTypes.map(type => (
                        <span 
                          key={type}
                          className="px-3 py-1 text-sm rounded-full"
                          style={{ 
                            backgroundColor: currentClassInfo.color + '20',
                            color: currentClassInfo.color,
                          }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowJobSelection(true)}
                      className="mt-4 px-4 py-2 text-sm bg-slate-800 border border-slate-600 text-slate-400 rounded hover:border-slate-500 transition-all"
                    >
                      Change Class (Test)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-800/50 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-lg font-rajdhani font-bold text-yellow-400">Achievements</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {unlockedAchievements.length} / {ACHIEVEMENTS.filter(a => !a.hidden).length}
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                    style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.filter(a => !a.hidden).length) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">👥</span>
                  <h3 className="text-lg font-rajdhani font-bold text-purple-400">Shadow Army</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {userShadows.length} / {SHADOW_SOLDIERS.length}
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: `${(userShadows.length / SHADOW_SOLDIERS.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="p-6 bg-slate-800/50 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">⚡</span>
                  <h3 className="text-lg font-rajdhani font-bold text-green-400">Active Bonuses</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {jobClass !== JobClass.NONE && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Class Bonus</span>
                      <span className="text-green-400">+{Math.round((currentClassInfo.bonusMultiplier - 1) * 100)}% XP</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Streak Bonus</span>
                    <span className="text-green-400">+{Math.min(questStreak, 30)}% XP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shadow Bonus</span>
                    <span className="text-green-400">+{userShadows.filter(s => s.isActive).length * 2}% XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <AchievementsPanel
            userAchievements={unlockedAchievements}
            stats={stats}
          />
        )}

        {activeTab === 'shadows' && (
          <ShadowArmyPanel
            userShadows={userShadows}
            stats={shadowStats}
            onActivateShadow={handleActivateShadow}
          />
        )}
      </div>

      {/* Job Class Selection Modal */}
      {showJobSelection && (
        <JobClassSelection
          currentLevel={level}
          currentClass={jobClass}
          onSelectClass={handleSelectClass}
          onClose={() => setShowJobSelection(false)}
        />
      )}
    </div>
  );
}
