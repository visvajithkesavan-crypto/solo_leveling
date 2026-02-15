/**
 * Solo Leveling System - Weekly Review Modal
 * 
 * Displays AI-generated weekly performance reviews with
 * insights, recommendations, and progress analysis.
 */

'use client';

import { useState } from 'react';
import { WeeklyReview } from '@/lib/api-ai-coach';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: WeeklyReview | null;
  onRequestReview?: () => Promise<void>;
  isLoading?: boolean;
}

const verdictConfig = {
  excellent: {
    emoji: '🏆',
    title: 'EXCELLENT PERFORMANCE',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/50',
    bgColor: 'bg-yellow-900/20',
    description: 'Outstanding! You have exceeded all expectations.',
  },
  good: {
    emoji: '⭐',
    title: 'GOOD PERFORMANCE',
    color: 'text-green-400',
    borderColor: 'border-green-500/50',
    bgColor: 'bg-green-900/20',
    description: 'Well done. You are making solid progress.',
  },
  adequate: {
    emoji: '👍',
    title: 'ADEQUATE PERFORMANCE',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/50',
    bgColor: 'bg-blue-900/20',
    description: 'Acceptable work. There is room for growth.',
  },
  needs_improvement: {
    emoji: '⚠️',
    title: 'NEEDS IMPROVEMENT',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/50',
    bgColor: 'bg-orange-900/20',
    description: 'Your performance requires attention.',
  },
  disappointing: {
    emoji: '💀',
    title: 'DISAPPOINTING',
    color: 'text-red-400',
    borderColor: 'border-red-500/50',
    bgColor: 'bg-red-900/20',
    description: 'Critical failure. Immediate action required.',
  },
};

export function WeeklyReviewModal({
  isOpen,
  onClose,
  review,
  onRequestReview,
  isLoading = false,
}: WeeklyReviewModalProps) {
  const [showFullInsights, setShowFullInsights] = useState(false);

  if (!isOpen) return null;

  const verdictInfo = review ? verdictConfig[review.verdict] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-2 border-purple-500/40 rounded-xl shadow-glow-purple">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-900/80 to-slate-800/80 border-b border-purple-500/30 p-6 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
          <h2 className="text-2xl font-rajdhani font-bold text-purple-400 tracking-widest">
            ◇ WEEKLY PERFORMANCE REVIEW ◇
          </h2>
          {review && (
            <p className="text-sm text-slate-400 mt-1 font-mono">
              Week {review.weekNumber} • {new Date(review.weekStart).toLocaleDateString()} - {new Date(review.weekEnd).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-pulse">📊</div>
              <p className="text-purple-400 font-rajdhani">Analyzing performance...</p>
              <p className="text-sm text-slate-500 mt-2">
                The System is evaluating your progress
              </p>
            </div>
          ) : !review ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📈</div>
              <p className="text-white font-rajdhani text-lg mb-2">No review available</p>
              <p className="text-slate-400 text-sm mb-6">
                Weekly reviews are generated at the end of each week
              </p>
              {onRequestReview && (
                <button
                  onClick={onRequestReview}
                  className="px-6 py-2 bg-purple-900/50 border border-purple-500/50 text-purple-300 font-rajdhani font-semibold rounded hover:bg-purple-800/50 transition-all"
                >
                  ◇ REQUEST EARLY REVIEW
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Verdict Banner */}
              {verdictInfo && (
                <div className={`${verdictInfo.bgColor} border ${verdictInfo.borderColor} rounded-lg p-6 text-center`}>
                  <div className="text-5xl mb-2">{verdictInfo.emoji}</div>
                  <h3 className={`text-xl font-rajdhani font-bold ${verdictInfo.color} mb-1`}>
                    {verdictInfo.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{verdictInfo.description}</p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="Quests Completed"
                  value={`${review.questsCompleted}/${review.questsTotal}`}
                  percentage={review.questsTotal > 0 
                    ? Math.round((review.questsCompleted / review.questsTotal) * 100) 
                    : 0}
                />
                <StatCard
                  label="XP Earned"
                  value={review.xpEarned.toLocaleString()}
                  icon="⚡"
                />
                <StatCard
                  label="Streak Days"
                  value={review.streakDays.toString()}
                  icon="🔥"
                />
                <StatCard
                  label="Performance"
                  value={`${Math.round(review.consistencyScore * 100)}%`}
                  icon="📊"
                />
              </div>

              {/* AI Insights */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-sm font-mono text-purple-400 mb-3">◇ SYSTEM ANALYSIS</h4>
                <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {showFullInsights || review.aiInsights.length <= 300
                    ? review.aiInsights
                    : `${review.aiInsights.slice(0, 300)}...`}
                </div>
                {review.aiInsights.length > 300 && (
                  <button
                    onClick={() => setShowFullInsights(!showFullInsights)}
                    className="text-purple-400 text-sm mt-2 hover:underline"
                  >
                    {showFullInsights ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>

              {/* Strengths */}
              {review.strengths && review.strengths.length > 0 && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-mono text-green-400 mb-3">✓ STRENGTHS</h4>
                  <ul className="space-y-2">
                    {review.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-green-400">+</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas to Improve */}
              {review.areasToImprove && review.areasToImprove.length > 0 && (
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-mono text-orange-400 mb-3">⚠️ AREAS TO IMPROVE</h4>
                  <ul className="space-y-2">
                    {review.areasToImprove.map((area, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-orange-400">!</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {review.recommendations && review.recommendations.length > 0 && (
                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-mono text-cyan-400 mb-3">◇ RECOMMENDATIONS</h4>
                  <ul className="space-y-3">
                    {review.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-cyan-400 font-bold">{index + 1}.</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Difficulty Adjustment */}
              {review.difficultyAdjustment !== 0 && (
                <div className={`rounded-lg p-4 border ${
                  review.difficultyAdjustment > 0 
                    ? 'bg-red-900/20 border-red-500/30' 
                    : 'bg-blue-900/20 border-blue-500/30'
                }`}>
                  <p className={`text-sm font-mono ${
                    review.difficultyAdjustment > 0 ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {review.difficultyAdjustment > 0 
                      ? `⬆️ Difficulty will increase by ${Math.abs(review.difficultyAdjustment)}%`
                      : `⬇️ Difficulty will decrease by ${Math.abs(review.difficultyAdjustment)}%`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900/90 border-t border-purple-500/30 p-4">
          <button
            onClick={onClose}
            className="w-full py-2 bg-purple-900/50 border border-purple-500/50 text-purple-300 font-rajdhani font-semibold rounded hover:bg-purple-800/50 transition-all"
          >
            ◇ CLOSE REVIEW ◇
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for stat cards
function StatCard({
  label,
  value,
  percentage,
  icon,
}: {
  label: string;
  value: string;
  percentage?: number;
  icon?: string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="flex items-center justify-center gap-1">
        {icon && <span>{icon}</span>}
        <span className="text-xl font-bold text-white">{value}</span>
      </div>
      {percentage !== undefined && (
        <div className="mt-2">
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
