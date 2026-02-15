/**
 * Solo Leveling System - Goal Setting Modal (Enhanced with Honest Ranking)
 * 
 * Multi-step modal flow:
 * 1. Goal input
 * 2. Assessment questions (AI asks probing questions)
 * 3. Honest rank reveal (brutally honest where they stand)
 * 4. Master plan generation
 * 
 * Implements Growth Mindset principles from Carol Dweck.
 */

'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SetGoalResponse } from '@/lib/api-ai-coach';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api';

// Types for assessment flow
interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'number' | 'boolean' | 'select' | 'text';
  required?: boolean;
}

interface HonestAssessment {
  currentRank: string;
  percentile: number;
  goalCategory: string;
  honestTruth: string;
  topOnePercentLooksLike: string;
  gapToTopOnePercent: string[];
  estimatedYearsToTop: number;
  immediateActions: string[];
  growthMindsetMessage: string;
  metrics: {
    name: string;
    currentValue: number | string;
    unit: string;
    percentile: number;
    topOnePercentValue: string;
  }[];
}

interface GoalSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalSet: (response: SetGoalResponse) => void;
  setGoal: (goalText: string, timelineDays?: number) => Promise<SetGoalResponse>;
  isLoading: boolean;
}

// Rank colors and labels
const RANK_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  'F': { color: 'text-gray-400', bg: 'bg-gray-900/50 border-gray-500', label: 'Beginner' },
  'E': { color: 'text-amber-600', bg: 'bg-amber-900/30 border-amber-600', label: 'Below Average' },
  'D': { color: 'text-green-500', bg: 'bg-green-900/30 border-green-600', label: 'Average' },
  'C': { color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-500', label: 'Above Average' },
  'B': { color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-500', label: 'Top 10%' },
  'A': { color: 'text-red-400', bg: 'bg-red-900/30 border-red-500', label: 'Top 1% (GOAL)' },
  'S': { color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-500', label: 'World Class' },
};

export function GoalSettingModal({
  isOpen,
  onClose,
  onGoalSet,
  setGoal,
  isLoading,
}: GoalSettingModalProps) {
  // Supabase client for auth
  const supabase = createClientComponentClient();
  
  // State
  const [goalText, setGoalText] = useState('');
  const [timelineDays, setTimelineDays] = useState(90);
  const [step, setStep] = useState<'input' | 'assessment' | 'assessing' | 'rank_reveal' | 'generating' | 'result'>('input');
  const [result, setResult] = useState<SetGoalResponse | null>(null);
  const [error, setError] = useState('');
  
  // Assessment state
  const [sessionId, setSessionId] = useState<string>('');
  const [category, setCategory] = useState<{ id: string; name: string; description: string } | null>(null);
  const [introMessage, setIntroMessage] = useState('');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number | string | boolean>>({});
  const [assessment, setAssessment] = useState<HonestAssessment | null>(null);
  const [followUpMessage, setFollowUpMessage] = useState('');

  // Helper to get auth headers
  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
    };
  };

  // Start assessment when goal is submitted
  const handleStartAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalText.trim() || goalText.trim().length < 10) {
      setError('Please enter a goal with at least 10 characters');
      return;
    }

    setStep('assessing');
    setError('');

    try {
      const headers = await getAuthHeaders();
      console.log('Calling assessment API:', `${API_URL}/v1/ai-coach/assessment/start`);
      console.log('Auth token present:', !!headers.Authorization);
      
      const response = await fetch(`${API_URL}/v1/ai-coach/assessment/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ goalText: goalText.trim() }),
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Assessment API error:', errorData);
        throw new Error(errorData.message || `API returned ${response.status}`);
      }

      const data = await response.json();
      console.log('Assessment response:', data);
      
      if (data.success) {
        setSessionId(data.data.sessionId);
        setCategory(data.data.category);
        setIntroMessage(data.data.introMessage);
        setQuestions(data.data.questions);
        setStep('assessment');
      } else {
        throw new Error(data.message || 'Failed to start assessment');
      }
    } catch (err) {
      console.error('Assessment start error:', err);
      // Check if it's an auth issue
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        setError('Please log in to continue');
        setStep('input');
        return;
      }
      // Fallback: Skip assessment and go directly to plan generation
      console.warn('Assessment API not available, falling back to direct plan');
      handleDirectPlanGeneration();
    }
  };

  // Submit assessment answers
  const handleSubmitAssessment = async () => {
    // Validate required answers
    const requiredQuestions = questions.filter(q => q.required);
    const missingRequired = requiredQuestions.filter(q => answers[q.id] === undefined || answers[q.id] === '');
    
    if (missingRequired.length > 0) {
      setError(`Please answer all required questions`);
      return;
    }

    setStep('assessing');
    setError('');

    try {
      const headers = await getAuthHeaders();
      console.log('Submitting assessment answers...');
      
      const response = await fetch(`${API_URL}/v1/ai-coach/assessment/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sessionId, answers }),
      });

      console.log('Submit response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Assessment submit error:', errorData);
        throw new Error(errorData.message || `API returned ${response.status}`);
      }

      const data = await response.json();
      console.log('Assessment result:', data);
      
      if (data.success) {
        setAssessment(data.data.assessment);
        setFollowUpMessage(data.data.followUpMessage);
        setStep('rank_reveal');
      } else {
        throw new Error(data.message || 'Failed to get assessment');
      }
    } catch (err) {
      console.error('Assessment submit failed:', err);
      handleDirectPlanGeneration();
    }
  };

  // Generate master plan after seeing rank
  const handleProceedToPlan = async () => {
    setStep('generating');
    
    try {
      const response = await setGoal(goalText.trim(), timelineDays);
      setResult(response);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
      setStep('rank_reveal');
    }
  };

  // Fallback: Direct plan generation without assessment
  const handleDirectPlanGeneration = async () => {
    setStep('generating');
    
    try {
      const response = await setGoal(goalText.trim(), timelineDays);
      setResult(response);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
      setStep('input');
    }
  };

  // Confirm and close
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

  // Reset and close
  const handleClose = () => {
    setGoalText('');
    setTimelineDays(90);
    setStep('input');
    setResult(null);
    setError('');
    setSessionId('');
    setCategory(null);
    setIntroMessage('');
    setQuestions([]);
    setAnswers({});
    setAssessment(null);
    setFollowUpMessage('');
    onClose();
  };

  // Update answer
  const updateAnswer = (questionId: string, value: number | string | boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  if (!isOpen) return null;

  const rankStyle = assessment ? RANK_STYLES[assessment.currentRank] || RANK_STYLES['F'] : null;

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
        <div className="sticky top-0 bg-slate-900/95 border-b border-cyan-500/30 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-rajdhani font-bold text-cyan-400 tracking-wider">
              {step === 'input' && '◈ SET YOUR GOAL ◈'}
              {step === 'assessment' && '◈ HONEST ASSESSMENT ◈'}
              {step === 'assessing' && '◈ ANALYZING... ◈'}
              {step === 'rank_reveal' && '◈ YOUR RANK REVEALED ◈'}
              {step === 'generating' && '◈ GENERATING PLAN ◈'}
              {step === 'result' && '◈ MASTER PLAN READY ◈'}
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="flex gap-2 mt-4">
            {['input', 'assessment', 'rank_reveal', 'result'].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  ['input', 'assessment', 'assessing', 'rank_reveal', 'generating', 'result'].indexOf(step) >= i
                    ? 'bg-cyan-400'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Step 1: Goal Input */}
          {step === 'input' && (
            <form onSubmit={handleStartAssessment} className="space-y-6">
              <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-cyan-300">
                  🎯 <strong>Your destination: TOP 1%</strong> — Tell us your goal, and we'll show you exactly where you stand and what it takes to reach the elite level.
                </p>
              </div>

              <div>
                <label className="block text-sm font-mono text-cyan-400/80 mb-2 tracking-wider">
                  WHAT DO YOU WANT TO ACHIEVE?
                </label>
                <textarea
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="e.g., I want to run a marathon, I want to lose 30 pounds and get visible abs, I want to deadlift 2x my bodyweight..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/40 rounded-lg text-slate-200 font-rajdhani placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-button-cyan transition-all resize-none"
                  required
                />
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
                      {days}
                    </button>
                  ))}
                </div>
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
                  ◇ ASSESS MY LEVEL
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Assessment Questions */}
          {step === 'assessment' && (
            <div className="space-y-6">
              {/* Category detected */}
              {category && (
                <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-cyan-400 font-bold">GOAL CATEGORY:</span>
                    <span className="text-white">{category.name}</span>
                  </div>
                  <p className="text-sm text-slate-400">{category.description}</p>
                </div>
              )}

              {/* AI Intro Message */}
              {introMessage && (
                <div className="bg-cyan-900/20 border border-cyan-500/40 rounded-lg p-4">
                  <p className="text-cyan-200 font-rajdhani">{introMessage}</p>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-4">
                <h3 className="text-lg font-rajdhani font-bold text-white">
                  📋 ANSWER HONESTLY
                </h3>
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                    <label className="block text-sm text-white mb-2">
                      {idx + 1}. {q.question}
                      {q.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {q.type === 'number' && (
                      <input
                        type="number"
                        value={answers[q.id] as number || ''}
                        onChange={(e) => updateAnswer(q.id, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white focus:border-cyan-400 focus:outline-none"
                        placeholder="Enter a number"
                      />
                    )}
                    {q.type === 'boolean' && (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => updateAnswer(q.id, true)}
                          className={`flex-1 py-2 rounded border ${
                            answers[q.id] === true
                              ? 'bg-green-900/50 border-green-500 text-green-300'
                              : 'bg-slate-900 border-slate-600 text-slate-400'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAnswer(q.id, false)}
                          className={`flex-1 py-2 rounded border ${
                            answers[q.id] === false
                              ? 'bg-red-900/50 border-red-500 text-red-300'
                              : 'bg-slate-900 border-slate-600 text-slate-400'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    )}
                    {q.type === 'text' && (
                      <input
                        type="text"
                        value={answers[q.id] as string || ''}
                        onChange={(e) => updateAnswer(q.id, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white focus:border-cyan-400 focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="flex-1 py-3 bg-slate-800 border border-slate-600 text-slate-400 font-rajdhani font-semibold rounded-lg"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAssessment}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500 text-cyan-300 font-rajdhani font-bold rounded-lg"
                >
                  ◇ REVEAL MY RANK
                </button>
              </div>
            </div>
          )}

          {/* Loading States */}
          {(step === 'assessing' || step === 'generating') && (
            <div className="text-center py-12">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl">{step === 'assessing' ? '⚖️' : '📜'}</span>
                </div>
              </div>
              <h3 className="text-xl font-rajdhani font-bold text-cyan-400 mb-2">
                {step === 'assessing' ? '◇ CALCULATING YOUR RANK ◇' : '◇ GENERATING MASTER PLAN ◇'}
              </h3>
              <p className="text-slate-400">
                {step === 'assessing' 
                  ? 'Comparing your metrics against real-world data...'
                  : 'Creating your personalized path to the top 1%...'}
              </p>
            </div>
          )}

          {/* Step 3: Rank Reveal */}
          {step === 'rank_reveal' && assessment && rankStyle && (
            <div className="space-y-6">
              {/* Big Rank Display */}
              <div className={`text-center py-8 rounded-xl border-2 ${rankStyle.bg}`}>
                <div className={`text-8xl font-bold ${rankStyle.color} mb-2`}>
                  {assessment.currentRank}
                </div>
                <div className={`text-xl ${rankStyle.color} font-rajdhani`}>
                  {rankStyle.label}
                </div>
                <div className="text-slate-400 mt-2">
                  {assessment.percentile}th percentile
                </div>
              </div>

              {/* Honest Truth */}
              <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-bold mb-2">⚠️ THE HONEST TRUTH</h4>
                <p className="text-slate-300">{assessment.honestTruth}</p>
              </div>

              {/* What Top 1% Looks Like */}
              <div className="bg-slate-800/50 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-yellow-400 font-bold mb-2">🏆 WHAT A-RANK (TOP 1%) LOOKS LIKE</h4>
                <p className="text-slate-300">{assessment.topOnePercentLooksLike}</p>
              </div>

              {/* Gap Analysis */}
              <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2">📊 THE GAP TO CLOSE</h4>
                <ul className="space-y-1">
                  {assessment.gapToTopOnePercent.map((gap, i) => (
                    <li key={i} className="text-slate-300 text-sm">• {gap}</li>
                  ))}
                </ul>
                <p className="text-cyan-400 mt-3 font-semibold">
                  Estimated time: {assessment.estimatedYearsToTop} years of dedicated effort
                </p>
              </div>

              {/* Growth Mindset Message */}
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/40 rounded-lg p-4">
                <h4 className="text-green-400 font-bold mb-2">🌱 GROWTH MINDSET</h4>
                <p className="text-green-200 italic">"{assessment.growthMindsetMessage}"</p>
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceedToPlan}
                className="w-full py-4 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-2 border-cyan-500/60 text-cyan-300 font-rajdhani font-bold text-lg rounded-lg hover:from-cyan-800/60 hover:to-blue-800/60 transition-all"
              >
                ◇ CREATE MY PATH TO TOP 1% ◇
              </button>
            </div>
          )}

          {/* Step 4: Result (Master Plan) */}
          {step === 'result' && result && (
            <div className="space-y-6">
              {/* Show rank if we have it */}
              {assessment && rankStyle && (
                <div className={`flex items-center gap-4 p-4 rounded-lg border ${rankStyle.bg}`}>
                  <div className={`text-4xl font-bold ${rankStyle.color}`}>
                    {assessment.currentRank}
                  </div>
                  <div>
                    <div className="text-white font-semibold">Your Starting Point</div>
                    <div className="text-sm text-slate-400">
                      {assessment.percentile}th percentile → Target: A-Rank (Top 1%)
                    </div>
                  </div>
                </div>
              )}

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

              {/* Daily Habits */}
              <div>
                <h3 className="text-lg font-rajdhani font-bold text-white mb-3">
                  🔄 DAILY HABITS ({result.masterPlan.dailyHabits.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {result.masterPlan.dailyHabits.slice(0, 6).map((habit, index) => (
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

              {/* Milestones */}
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
                  ◈ BEGIN MY JOURNEY TO TOP 1% ◈
                </button>
                <p className="text-center text-xs text-slate-500 mt-2">
                  Your daily quests will be generated based on your current rank
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
