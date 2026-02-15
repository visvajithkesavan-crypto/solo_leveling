/**
 * Solo Leveling System - Goal Setting Modal
 * 
 * Modal for setting a new life goal with AI analysis
 * and master plan generation.
 */

'use client';

import { useState } from 'react';
import { SetGoalResponse } from '@/lib/api-ai-coach';

interface GoalSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalSet: (response: SetGoalResponse) => void;
  setGoal: (goalText: string, timelineDays?: number) => Promise<SetGoalResponse>;
  isLoading: boolean;
}

export function GoalSettingModal({
  isOpen,
  onClose,
  onGoalSet,
  setGoal,
  isLoading,
}: GoalSettingModalProps) {
  const [goalText, setGoalText] = useState('');
  const [timelineDays, setTimelineDays] = useState(90);
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input');
  const [result, setResult] = useState<SetGoalResponse | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalText.trim() || goalText.trim().length < 10) {
      setError('Please enter a goal with at least 10 characters');
      return;
    }

    setStep('analyzing');
    setError('');

    try {
      const response = await setGoal(goalText.trim(), timelineDays);
      setResult(response);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze goal');
      setStep('input');
    }
  };

  const handleConfirm = () => {
    if (result) {
      try {
        onGoalSet(result);
      } catch (err) {
        console.error('Error in onGoalSet:', err);
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setGoalText('');
    setTimelineDays(90);
    setStep('input');
    setResult(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/60 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 border-b border-cyan-500/30 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-rajdhani font-bold text-cyan-400 tracking-wider">
              ◈ SET YOUR GOAL ◈
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            The System will analyze your goal and create a personalized Master Plan
          </p>
        </div>

        <div className="p-6">
          {/* Step 1: Input */}
          {step === 'input' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-mono text-cyan-400/80 mb-2 tracking-wider">
                  YOUR LIFE GOAL
                </label>
                <textarea
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="e.g., I want to lose 20 pounds and build a consistent exercise habit in the next 90 days"
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/40 rounded-lg text-slate-200 font-rajdhani placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-button-cyan transition-all resize-none"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  Be specific about what you want to achieve and by when
                </p>
              </div>

              <div>
                <label className="block text-sm font-mono text-cyan-400/80 mb-2 tracking-wider">
                  TIMELINE (DAYS)
                </label>
                <div className="flex gap-3">
                  {[30, 60, 90, 180].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setTimelineDays(days)}
                      className={`flex-1 py-2 px-4 rounded-lg border font-rajdhani font-semibold transition-all ${
                        timelineDays === days
                          ? 'bg-cyan-900/50 border-cyan-400 text-cyan-300'
                          : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                <h4 className="text-sm font-mono text-yellow-400 mb-2">💡 TIPS FOR EFFECTIVE GOALS</h4>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• Be specific: "Lose 20 pounds" not "Get healthier"</li>
                  <li>• Include a timeframe: "in 90 days"</li>
                  <li>• Make it measurable: Include numbers or milestones</li>
                  <li>• Keep it challenging but achievable</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 bg-slate-800 border border-slate-600 text-slate-400 font-rajdhani font-semibold rounded-lg hover:border-slate-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || goalText.trim().length < 10}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500 text-cyan-300 font-rajdhani font-bold rounded-lg hover:from-cyan-800/60 hover:to-blue-800/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ◇ ANALYZE GOAL
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Analyzing */}
          {step === 'analyzing' && (
            <div className="text-center py-12">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl">🧠</span>
                </div>
              </div>
              <h3 className="text-xl font-rajdhani font-bold text-cyan-400 mb-2">
                ◇ ANALYZING YOUR GOAL ◇
              </h3>
              <p className="text-slate-400 mb-4">
                The System is processing your objective...
              </p>
              <div className="text-sm text-slate-500 animate-pulse">
                Generating personalized Master Plan
              </div>
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && result && (
            <div className="space-y-6">
              {/* System Message */}
              <div className="bg-cyan-900/30 border border-cyan-500/50 rounded-lg p-4">
                <p className="text-cyan-300 font-rajdhani">{result.systemMessage}</p>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-lg font-rajdhani font-bold text-white mb-2">
                  📋 MASTER PLAN SUMMARY
                </h3>
                <p className="text-slate-300">{result.masterPlan.summary}</p>
              </div>

              {/* Phases */}
              <div>
                <h3 className="text-lg font-rajdhani font-bold text-white mb-3">
                  ⚡ PHASES ({result.masterPlan.phases.length})
                </h3>
                <div className="space-y-2">
                  {result.masterPlan.phases.map((phase, index) => (
                    <div
                      key={index}
                      className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-rajdhani font-semibold text-cyan-400">
                          Phase {phase.number}: {phase.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          Days {phase.startDay}-{phase.endDay}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{phase.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Habits Preview */}
              <div>
                <h3 className="text-lg font-rajdhani font-bold text-white mb-3">
                  🔄 DAILY HABITS ({result.masterPlan.dailyHabits.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {result.masterPlan.dailyHabits.slice(0, 4).map((habit, index) => (
                    <div
                      key={index}
                      className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-2 text-sm"
                    >
                      <span className="text-white">{habit.title}</span>
                      <span className="text-yellow-400 text-xs ml-2">+{habit.xpReward} XP</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones Preview */}
              <div>
                <h3 className="text-lg font-rajdhani font-bold text-white mb-3">
                  🏆 MILESTONES ({result.masterPlan.milestones.length})
                </h3>
                <div className="space-y-2">
                  {result.masterPlan.milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-slate-800/50 border border-slate-600/50 rounded-lg p-2"
                    >
                      <div className="w-8 h-8 bg-yellow-900/50 border border-yellow-500/50 rounded-full flex items-center justify-center text-yellow-400 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <span className="text-white text-sm">{milestone.title}</span>
                        <span className="text-slate-500 text-xs ml-2">Day {milestone.targetDay}</span>
                      </div>
                      <span className="text-yellow-400 text-xs">+{milestone.reward.xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Button */}
              <div className="pt-4 border-t border-slate-700">
                <button
                  onClick={handleConfirm}
                  className="w-full py-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-2 border-green-500/60 text-green-300 font-rajdhani font-bold text-lg rounded-lg hover:from-green-800/60 hover:to-emerald-800/60 transition-all"
                >
                  ◈ ACCEPT MASTER PLAN ◈
                </button>
                <p className="text-center text-xs text-slate-500 mt-2">
                  Your daily quests will be generated automatically
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
