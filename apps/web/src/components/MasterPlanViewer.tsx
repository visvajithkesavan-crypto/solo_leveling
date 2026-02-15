/**
 * Solo Leveling System - Master Plan Viewer
 * 
 * Displays the full master plan with timeline, phases,
 * habits, milestones, and progress tracking.
 */

'use client';

import { useState } from 'react';
import { MasterGoal, MasterPlan, MilestoneRecord, GoalProgress } from '@/lib/api-ai-coach';

interface MasterPlanViewerProps {
  goal: MasterGoal;
  masterPlan: MasterPlan;
  milestones: MilestoneRecord[];
  progress: GoalProgress | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MasterPlanViewer({
  goal,
  masterPlan,
  milestones,
  progress,
  isOpen,
  onClose,
}: MasterPlanViewerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'habits' | 'milestones'>('overview');

  if (!isOpen) return null;

  const startDate = new Date(goal.startDate);
  const targetDate = new Date(goal.targetDate);
  const today = new Date();
  const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercentage = progress?.percentage || Math.min(100, (daysElapsed / goal.timelineDays) * 100);

  // Find current phase
  const currentPhase = masterPlan.phases.find(
    (p) => daysElapsed >= p.startDay - 1 && daysElapsed <= p.endDay
  ) || masterPlan.phases[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/60 rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="shrink-0 bg-slate-900/95 border-b border-purple-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-rajdhani font-bold text-purple-400 tracking-wider">
              ◈ MASTER PLAN ◈
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Goal Summary */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
            <p className="text-white font-rajdhani text-lg">{goal.goalText}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
              <span>📅 Started: {startDate.toLocaleDateString()}</span>
              <span>🎯 Target: {targetDate.toLocaleDateString()}</span>
              <span>⏱️ {goal.timelineDays} days</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-purple-400 font-mono">PROGRESS</span>
              <span className="text-white font-bold">{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Day {daysElapsed} of {goal.timelineDays}</span>
              <span>{progress?.daysRemaining || goal.timelineDays - daysElapsed} days remaining</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {(['overview', 'phases', 'habits', 'milestones'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-rajdhani font-semibold rounded-t-lg transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-purple-900/50 border-b-2 border-purple-400 text-purple-400'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <p className="text-purple-200 font-rajdhani text-lg">{masterPlan.summary}</p>
              </div>

              {/* Current Phase */}
              {currentPhase && (
                <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
                  <h3 className="text-cyan-400 font-rajdhani font-bold mb-2">
                    📍 CURRENT PHASE: {currentPhase.name}
                  </h3>
                  <p className="text-slate-300 mb-3">{currentPhase.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {currentPhase.focus.map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-cyan-900/30 border border-cyan-500/30 rounded text-xs text-cyan-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{masterPlan.phases.length}</div>
                  <div className="text-xs text-slate-500">Phases</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{masterPlan.dailyHabits.length}</div>
                  <div className="text-xs text-slate-500">Daily Habits</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{masterPlan.milestones.length}</div>
                  <div className="text-xs text-slate-500">Milestones</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {milestones.filter((m) => m.status === 'completed').length}
                  </div>
                  <div className="text-xs text-slate-500">Completed</div>
                </div>
              </div>

              {/* Next Milestone */}
              {milestones.length > 0 && (
                <div>
                  <h3 className="text-lg font-rajdhani font-bold text-white mb-3">🎯 NEXT MILESTONE</h3>
                  {(() => {
                    const next = milestones.find((m) => m.status === 'pending' || m.status === 'in_progress');
                    if (!next) return <p className="text-slate-400">All milestones completed!</p>;
                    return (
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-yellow-400 font-rajdhani font-bold">{next.title}</span>
                          <span className="text-xs text-slate-400">
                            Target: {new Date(next.targetDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">{next.description}</p>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500 transition-all"
                            style={{ width: `${next.completionPercentage}%` }}
                          />
                        </div>
                        <div className="text-right text-xs text-yellow-400 mt-1">
                          {next.completionPercentage.toFixed(0)}% complete
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Phases Tab */}
          {activeTab === 'phases' && (
            <div className="space-y-4">
              {masterPlan.phases.map((phase, index) => {
                const isActive = phase.number === currentPhase?.number;
                const isCompleted = daysElapsed > phase.endDay;
                
                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-all ${
                      isActive
                        ? 'bg-cyan-900/30 border-cyan-500/50'
                        : isCompleted
                        ? 'bg-green-900/20 border-green-500/30 opacity-75'
                        : 'bg-slate-800/50 border-slate-600/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          isActive
                            ? 'bg-cyan-500 text-white'
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-600 text-slate-300'
                        }`}>
                          {isCompleted ? '✓' : phase.number}
                        </div>
                        <span className={`font-rajdhani font-bold text-lg ${
                          isActive ? 'text-cyan-400' : isCompleted ? 'text-green-400' : 'text-white'
                        }`}>
                          {phase.name}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs rounded">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-slate-400">
                        Days {phase.startDay} - {phase.endDay}
                      </span>
                    </div>
                    
                    <p className="text-slate-300 mb-3">{phase.description}</p>
                    
                    <div className="mb-3">
                      <span className="text-xs text-slate-500 block mb-1">Focus Areas:</span>
                      <div className="flex flex-wrap gap-1">
                        {phase.focus.map((f, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Expected Outcomes:</span>
                      <ul className="text-sm text-slate-400 space-y-1">
                        {phase.expectedOutcomes.map((outcome, i) => (
                          <li key={i}>• {outcome}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Habits Tab */}
          {activeTab === 'habits' && (
            <div className="space-y-3">
              {masterPlan.dailyHabits.map((habit, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-rajdhani font-semibold">{habit.title}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        habit.difficulty === 'easy'
                          ? 'bg-green-900/50 text-green-400'
                          : habit.difficulty === 'medium'
                          ? 'bg-yellow-900/50 text-yellow-400'
                          : 'bg-red-900/50 text-red-400'
                      }`}>
                        {habit.difficulty.toUpperCase()}
                      </span>
                      <span className="text-yellow-400 text-sm">+{habit.xpReward} XP</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{habit.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="capitalize">📁 {habit.category}</span>
                    <span>🔄 {habit.frequency}</span>
                    {habit.targetValue && habit.metricKey && (
                      <span>🎯 {habit.targetValue} {habit.metricKey}</span>
                    )}
                    {habit.statBonus && (
                      <span className="text-purple-400">📈 +{habit.statBonus}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              {milestones.length > 0 ? (
                milestones.map((milestone, index) => {
                  const statusColors = {
                    pending: 'border-slate-600 bg-slate-800/50',
                    in_progress: 'border-yellow-500/50 bg-yellow-900/20',
                    completed: 'border-green-500/50 bg-green-900/20',
                    missed: 'border-red-500/50 bg-red-900/20',
                  };
                  const statusIcons = {
                    pending: '⏳',
                    in_progress: '🔥',
                    completed: '✅',
                    missed: '❌',
                  };

                  return (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${statusColors[milestone.status]}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{statusIcons[milestone.status]}</span>
                          <span className="text-white font-rajdhani font-bold">{milestone.title}</span>
                        </div>
                        <span className="text-sm text-slate-400">
                          Day {masterPlan.milestones[milestone.milestoneIndex]?.targetDay || '?'}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="text-slate-300 text-sm mb-3">{milestone.description}</p>
                      )}
                      
                      {/* Progress bar */}
                      <div className="mb-2">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              milestone.status === 'completed'
                                ? 'bg-green-500'
                                : milestone.status === 'missed'
                                ? 'bg-red-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${milestone.completionPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-slate-500">{milestone.completionPercentage.toFixed(0)}% complete</span>
                          {milestone.completedAt && (
                            <span className="text-green-400">
                              Completed: {new Date(milestone.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-yellow-400">+{milestone.bonusXpAwarded || masterPlan.milestones[milestone.milestoneIndex]?.reward?.xp || 0} XP</span>
                        {milestone.shadowUnlocked && (
                          <span className="text-purple-400">👤 Shadow Unlocked: {milestone.shadowUnlocked}</span>
                        )}
                      </div>

                      {/* Celebration Message */}
                      {milestone.celebrationMessage && (
                        <div className="mt-3 bg-green-900/30 border border-green-500/30 rounded p-2 text-green-300 text-sm">
                          {milestone.celebrationMessage}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                masterPlan.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-rajdhani font-semibold">{milestone.title}</span>
                      <span className="text-sm text-slate-400">Day {milestone.targetDay}</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{milestone.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-yellow-400">+{milestone.reward.xp} XP</span>
                      {milestone.reward.shadowUnlock && (
                        <span className="text-purple-400">👤 {milestone.reward.shadowUnlock}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
