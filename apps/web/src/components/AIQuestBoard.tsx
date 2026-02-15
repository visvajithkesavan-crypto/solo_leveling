/**
 * Solo Leveling System - AI Quest Board
 * 
 * Displays AI-generated daily quests with completion,
 * regeneration, and progress tracking.
 */

'use client';

import { useState } from 'react';
import { AIDailyQuest, GoalProgress, CompleteQuestResponse } from '@/lib/api-ai-coach';
import { useFloatingXP } from '@/components/FloatingXP';
import { useSystemMessage } from '@/hooks/useSystemMessage';

interface AIQuestBoardProps {
  quests: AIDailyQuest[];
  goalProgress: GoalProgress | null;
  canRegenerate: boolean;
  regenerationsRemaining: number;
  isRegenerating: boolean;
  onCompleteQuest: (questId: string, actualValue?: number) => Promise<CompleteQuestResponse>;
  onRegenerateQuests: (reason?: string) => Promise<void>;
  onViewMasterPlan: () => void;
  hasActiveGoal: boolean;
  onSetGoal: () => void;
}

const difficultyConfig = {
  easy: {
    color: 'green',
    rank: 'E',
    borderClass: 'border-green-500/50',
    bgClass: 'bg-green-900/20',
    textClass: 'text-green-400',
  },
  medium: {
    color: 'yellow',
    rank: 'D',
    borderClass: 'border-yellow-500/50',
    bgClass: 'bg-yellow-900/20',
    textClass: 'text-yellow-400',
  },
  hard: {
    color: 'orange',
    rank: 'B',
    borderClass: 'border-orange-500/50',
    bgClass: 'bg-orange-900/20',
    textClass: 'text-orange-400',
  },
  extreme: {
    color: 'red',
    rank: 'S',
    borderClass: 'border-red-500/50',
    bgClass: 'bg-red-900/20',
    textClass: 'text-red-400',
  },
};

export function AIQuestBoard({
  quests,
  goalProgress,
  canRegenerate,
  regenerationsRemaining,
  isRegenerating,
  onCompleteQuest,
  onRegenerateQuests,
  onViewMasterPlan,
  hasActiveGoal,
  onSetGoal,
}: AIQuestBoardProps) {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const { showFloatingXP } = useFloatingXP();
  const { showMessage, showCustomMessage } = useSystemMessage();

  const pendingQuests = quests.filter((q) => q.status === 'pending' || q.status === 'in_progress');
  const completedQuests = quests.filter((q) => q.status === 'completed');

  const handleComplete = async (quest: AIDailyQuest) => {
    setCompletingId(quest.id);
    try {
      const response = await onCompleteQuest(quest.id);
      
      // Show floating XP
      const questElement = document.getElementById(`ai-quest-${quest.id}`);
      showFloatingXP(response.xpAwarded, questElement);

      // Show system message
      if (response.levelUp) {
        showCustomMessage('praise', 'LEVEL UP!', response.systemMessage);
      } else {
        showMessage('questCompleted');
      }

      // Show milestone celebration if reached
      if (response.milestonesReached && response.milestonesReached.length > 0) {
        setTimeout(() => {
          const milestone = response.milestonesReached![0];
          showCustomMessage(
            'praise',
            'MILESTONE ACHIEVED!',
            milestone.celebrationMessage || `You have completed: ${milestone.title}`
          );
        }, 2000);
      }
    } catch (error) {
      showCustomMessage(
        'warning',
        'QUEST FAILED',
        error instanceof Error ? error.message : 'Failed to complete quest'
      );
    } finally {
      setCompletingId(null);
    }
  };

  const handleRegenerate = async () => {
    try {
      await onRegenerateQuests();
      showCustomMessage(
        'notification',
        'QUESTS REGENERATED',
        `New challenges await. Regenerations remaining: ${regenerationsRemaining - 1}`
      );
    } catch (error) {
      showCustomMessage(
        'warning',
        'REGENERATION FAILED',
        error instanceof Error ? error.message : 'Failed to regenerate quests'
      );
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-cyan-500/40 rounded-xl shadow-quest">
      {/* Header */}
      <div className="border-b border-cyan-500/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-rajdhani font-bold text-cyan-400 tracking-widest">
            ◇ AI DAILY QUESTS ◇
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-slate-500">
              {completedQuests.length}/{quests.length} COMPLETE
            </span>
            {hasActiveGoal && (
              <button
                onClick={onViewMasterPlan}
                className="px-3 py-1 bg-purple-900/50 border border-purple-500/50 text-purple-300 text-xs font-rajdhani rounded hover:bg-purple-800/50 transition-all"
              >
                📋 Master Plan
              </button>
            )}
          </div>
        </div>

        {/* Goal Progress Bar */}
        {goalProgress && (
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-cyan-400">Goal Progress</span>
              <span className="text-white">{goalProgress.percentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                style={{ width: `${goalProgress.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{goalProgress.currentPhase}</span>
              <span>Day {goalProgress.daysElapsed} • {goalProgress.daysRemaining} days left</span>
            </div>
          </div>
        )}

        {/* No Goal State */}
        {!hasActiveGoal && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
            <p className="text-yellow-400 mb-2">⚠️ No active goal set</p>
            <p className="text-slate-400 text-sm mb-3">
              Set a goal to receive personalized AI-generated quests
            </p>
            <button
              onClick={onSetGoal}
              className="px-4 py-2 bg-yellow-900/50 border border-yellow-500/50 text-yellow-300 font-rajdhani font-semibold rounded hover:bg-yellow-800/50 transition-all"
            >
              ◇ SET YOUR GOAL
            </button>
          </div>
        )}
      </div>

      {/* Quest List */}
      <div className="p-4">
        {pendingQuests.length === 0 && completedQuests.length === 0 ? (
          <div className="text-center py-8 opacity-60">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-lg font-rajdhani text-cyan-400">No quests available</p>
            <p className="text-sm text-slate-500 mt-2">
              {hasActiveGoal ? 'Quests will be generated soon' : 'Set a goal to begin'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Pending Quests */}
            {pendingQuests.map((quest) => {
              const config = difficultyConfig[quest.difficulty];
              const isCompleting = completingId === quest.id;

              return (
                <div
                  key={quest.id}
                  id={`ai-quest-${quest.id}`}
                  className={`border rounded-lg p-4 transition-all ${config.borderClass} ${config.bgClass} ${
                    isCompleting ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${config.bgClass} ${config.textClass} border ${config.borderClass}`}>
                          {config.rank}-RANK
                        </span>
                        <span className="text-xs text-slate-500 capitalize">{quest.questType}</span>
                      </div>
                      <h3 className="text-white font-rajdhani font-semibold">{quest.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">{quest.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-yellow-400 font-bold">+{quest.xpReward} XP</div>
                      {quest.statBonus && (
                        <div className="text-xs text-purple-400">+{quest.statBonus}</div>
                      )}
                    </div>
                  </div>

                  {/* Target */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-500">
                      🎯 Target: {quest.targetValue} {quest.metricKey}
                    </span>
                    <button
                      onClick={() => handleComplete(quest)}
                      disabled={isCompleting}
                      className={`px-4 py-1.5 bg-green-900/50 border border-green-500/50 text-green-300 text-sm font-rajdhani font-semibold rounded hover:bg-green-800/50 transition-all disabled:opacity-50`}
                    >
                      {isCompleting ? '◇ COMPLETING...' : '✓ COMPLETE'}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Completed Quests */}
            {completedQuests.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-mono text-green-400 mb-2">✓ COMPLETED TODAY</h3>
                <div className="space-y-2 opacity-60">
                  {completedQuests.map((quest) => (
                    <div
                      key={quest.id}
                      className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-green-400">✓</span>
                        <span className="text-slate-300 line-through">{quest.title}</span>
                      </div>
                      <span className="text-green-400 text-sm">+{quest.xpReward} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Regenerate Button */}
      {hasActiveGoal && quests.length > 0 && (
        <div className="border-t border-cyan-500/30 p-4">
          <button
            onClick={handleRegenerate}
            disabled={!canRegenerate || isRegenerating}
            className={`w-full py-2 font-rajdhani font-semibold rounded transition-all ${
              canRegenerate
                ? 'bg-slate-800 border border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300'
                : 'bg-slate-800/50 border border-slate-700 text-slate-600 cursor-not-allowed'
            }`}
          >
            {isRegenerating
              ? '◇ REGENERATING...'
              : `🔄 REGENERATE QUESTS (${regenerationsRemaining} left)`}
          </button>
          <p className="text-xs text-slate-500 text-center mt-2">
            Don't like today's quests? Generate new ones (limited per day)
          </p>
        </div>
      )}
    </div>
  );
}
