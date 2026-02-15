/**
 * Solo Leveling System - Progress Toward Goal Widget
 * 
 * A compact widget showing the user's progress toward their
 * master goal with phase information and milestones.
 */

'use client';

import { MasterGoal, MasterPlan, GoalProgress } from '@/lib/api-ai-coach';

interface ProgressTowardGoalWidgetProps {
  goal: MasterGoal | null;
  plan: MasterPlan | null;
  progress: GoalProgress | null;
  milestonesCompleted: number;
  totalMilestones: number;
  onViewDetails?: () => void;
  onSetGoal?: () => void;
  className?: string;
}

export function ProgressTowardGoalWidget({
  goal,
  plan,
  progress,
  milestonesCompleted,
  totalMilestones,
  onViewDetails,
  onSetGoal,
  className = '',
}: ProgressTowardGoalWidgetProps) {
  // No goal set
  if (!goal || !plan) {
    return (
      <div className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-yellow-500/40 rounded-xl p-4 ${className}`}>
        <div className="text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-yellow-400 font-rajdhani font-bold mb-1">NO GOAL SET</h3>
          <p className="text-slate-400 text-sm mb-3">
            Set a goal to begin your journey
          </p>
          {onSetGoal && (
            <button
              onClick={onSetGoal}
              className="px-4 py-2 bg-yellow-900/50 border border-yellow-500/50 text-yellow-300 text-sm font-rajdhani font-semibold rounded hover:bg-yellow-800/50 transition-all"
            >
              ◇ SET GOAL
            </button>
          )}
        </div>
      </div>
    );
  }

  // Calculate phase info
  const currentPhaseIndex = plan.phases.findIndex((p) => p.phaseNumber === plan.currentPhase);
  const currentPhase = plan.phases[currentPhaseIndex] || plan.phases[0];
  const phaseProgress = currentPhase
    ? Math.min(100, (progress?.daysElapsed || 0 / (currentPhase.durationDays * (currentPhaseIndex + 1))) * 100)
    : 0;

  // Calculate time info
  const totalDays = plan.phases.reduce((sum, p) => sum + p.durationDays, 0);
  const daysElapsed = progress?.daysElapsed || 0;
  const daysRemaining = Math.max(0, totalDays - daysElapsed);

  return (
    <div className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-cyan-500/40 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border-b border-cyan-500/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-cyan-400 font-rajdhani font-bold tracking-widest">
            ◇ MASTER GOAL ◇
          </h3>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="text-xs text-slate-400 hover:text-cyan-300 transition-colors"
            >
              View Details →
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Goal Title */}
        <div>
          <p className="text-white font-rajdhani text-lg leading-tight line-clamp-2">
            {goal.goalText}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {goal.timelineMonths} month plan • Started {new Date(goal.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-cyan-400">Overall Progress</span>
            <span className="text-white font-bold">{progress?.percentage.toFixed(1) || 0}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-700"
              style={{ width: `${progress?.percentage || 0}%` }}
            />
          </div>
        </div>

        {/* Current Phase */}
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-purple-900/50 border border-purple-500/50 text-purple-300 text-xs font-mono rounded">
              Phase {plan.currentPhase}
            </span>
            <span className="text-white text-sm font-rajdhani">
              {currentPhase?.name}
            </span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(100, phaseProgress)}%` }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Days Elapsed */}
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-white">{daysElapsed}</div>
            <div className="text-xs text-slate-500">Days In</div>
          </div>

          {/* Days Remaining */}
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-cyan-400">{daysRemaining}</div>
            <div className="text-xs text-slate-500">Days Left</div>
          </div>

          {/* Milestones */}
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-yellow-400">
              {milestonesCompleted}/{totalMilestones}
            </div>
            <div className="text-xs text-slate-500">Milestones</div>
          </div>
        </div>

        {/* Phase Timeline */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Phase Progress</span>
            <span>{plan.phases.length} phases</span>
          </div>
          <div className="flex gap-1">
            {plan.phases.map((phase, index) => {
              const isCompleted = phase.phaseNumber < plan.currentPhase;
              const isCurrent = phase.phaseNumber === plan.currentPhase;
              
              return (
                <div
                  key={phase.phaseNumber}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500'
                      : 'bg-slate-700'
                  }`}
                  title={`Phase ${phase.phaseNumber}: ${phase.name}`}
                />
              );
            })}
          </div>
        </div>

        {/* Quick Milestones Preview */}
        {totalMilestones > 0 && (
          <div className="border-t border-slate-700/50 pt-3">
            <div className="text-xs text-slate-500 mb-2">Next Milestones</div>
            <div className="flex gap-2">
              {plan.milestones
                .filter((m) => !m.completedAt)
                .slice(0, 3)
                .map((milestone, index) => (
                  <div
                    key={milestone.id || index}
                    className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-400 truncate"
                    title={milestone.title}
                  >
                    🏆 {milestone.title}
                  </div>
                ))}
              {plan.milestones.filter((m) => !m.completedAt).length === 0 && (
                <div className="text-xs text-green-400">
                  ✓ All milestones completed!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
