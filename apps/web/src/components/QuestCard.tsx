'use client';

import { useState } from 'react';
import { Goal, QuestStatus } from '@solo-leveling/shared';

interface QuestCardProps {
  goal: Goal;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * Holographic Quest Card with Solo Leveling styling
 * Features: animated borders, hover effects, difficulty badges
 */
export function QuestCard({ goal, onComplete, onDelete }: QuestCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleComplete = async () => {
    if (!onComplete) return;
    setIsCompleting(true);
    try {
      await onComplete(goal.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(goal.id);
    } finally {
      setIsDeleting(false);
    }
  };

  // Difficulty configurations
  const difficultyConfig: Record<string, { color: string; border: string; bg: string; label: string }> = {
    easy: { color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-900/30', label: 'E' },
    medium: { color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-900/30', label: 'D' },
    hard: { color: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-900/30', label: 'B' },
    extreme: { color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-900/30', label: 'S' },
  };

  const difficulty = goal.difficulty || 'medium';
  const diffStyle = difficultyConfig[difficulty] || difficultyConfig.medium;

  // Calculate progress if available
  const progress = goal.progress !== undefined && goal.target 
    ? (goal.progress / goal.target) * 100 
    : null;

  return (
    <div
      id={`quest-${goal.id}`}
      className={`
        quest-card-holographic relative
        bg-gradient-to-br from-slate-800/90 via-slate-850/90 to-slate-900/95
        border-2 rounded-lg p-5
        transition-all duration-300 ease-out
        ${isHovered 
          ? 'border-cyan-400 shadow-quest-hover translate-y-[-4px] scale-[1.02]' 
          : 'border-cyan-500/40 shadow-quest'
        }
        ${isCompleting || isDeleting ? 'opacity-60 pointer-events-none' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated corner accent */}
      <div className="absolute top-2 left-2 quest-corner-glow">
        <span className="text-cyan-400 text-lg font-bold opacity-80">◈</span>
      </div>
      <div className="absolute top-2 right-2 quest-corner-glow">
        <span className="text-cyan-400 text-lg font-bold opacity-80">◈</span>
      </div>

      {/* Header: Difficulty + Title */}
      <div className="flex items-start gap-3 mb-4 pt-4">
        {/* Difficulty Badge */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 
            flex items-center justify-center
            ${diffStyle.bg} ${diffStyle.border} ${diffStyle.color}
            border-2 rounded-md font-rajdhani font-bold text-lg
            shadow-difficulty
          `}
        >
          {diffStyle.label}
        </div>

        {/* Quest Title */}
        <h3 className="flex-1 text-lg font-rajdhani font-bold text-yellow-400 tracking-wide leading-tight uppercase">
          {goal.title}
        </h3>
      </div>

      {/* Quest Description */}
      {goal.description && (
        <p className="text-sm text-slate-300/90 mb-4 leading-relaxed pl-1">
          {goal.description}
        </p>
      )}

      {/* Progress Bar (if quest has progress tracking) */}
      {progress !== null && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
            <span className="text-cyan-400/80 font-rajdhani tracking-wider">PROGRESS</span>
            <span className="text-cyan-300">{goal.progress} / {goal.target}</span>
          </div>
          <div className="h-2.5 bg-slate-900/80 border border-cyan-500/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-400 transition-all duration-700 ease-out progress-bar-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* XP Reward Display */}
      {goal.xp_reward && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">REWARD:</span>
          <span className="text-sm font-rajdhani font-bold text-yellow-400 tracking-wider">
            +{goal.xp_reward} XP
          </span>
        </div>
      )}

      {/* Metadata */}
      <div className="flex justify-between items-center text-xs text-slate-500 mb-4 font-mono border-t border-cyan-500/20 pt-3">
        <span>REGISTERED: {new Date(goal.created_at).toLocaleDateString()}</span>
        {goal.status && (
          <span className={`
            px-2 py-0.5 rounded text-[10px] tracking-wider uppercase
            ${goal.status === QuestStatus.COMPLETED ? 'bg-green-900/50 text-green-400 border border-green-500/30' : ''}
            ${goal.status === QuestStatus.ACTIVE ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/30' : ''}
            ${goal.status === QuestStatus.FAILED ? 'bg-red-900/50 text-red-400 border border-red-500/30' : ''}
          `}>
            {goal.status}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onComplete && (
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="
              flex-1 py-2.5 px-4
              bg-gradient-to-r from-cyan-900/50 to-blue-900/50 
              border border-cyan-500/70
              text-cyan-300 font-rajdhani font-semibold text-sm
              rounded tracking-widest uppercase
              hover:from-cyan-800/60 hover:to-blue-800/60 
              hover:border-cyan-400 hover:text-cyan-200
              hover:shadow-button-cyan
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-[0.98]
            "
          >
            {isCompleting ? '◇ PROCESSING...' : '◇ COMPLETE'}
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="
              py-2.5 px-4
              bg-gradient-to-r from-red-900/40 to-red-950/40 
              border border-red-500/50
              text-red-400 font-rajdhani font-semibold text-sm
              rounded tracking-widest uppercase
              hover:from-red-800/50 hover:to-red-900/50 
              hover:border-red-400 hover:text-red-300
              hover:shadow-button-red
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-[0.98]
            "
          >
            ◇ REMOVE
          </button>
        )}
      </div>

      {/* Hover glow overlay */}
      <div 
        className={`
          absolute inset-0 rounded-lg pointer-events-none
          bg-gradient-to-t from-cyan-500/5 to-transparent
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
      />
    </div>
  );
}

export default QuestCard;
