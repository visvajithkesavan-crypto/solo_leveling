'use client';

import { useEffect, useState, useCallback } from 'react';
import { playSound } from '@/lib/sounds';

interface LevelUpCinematicProps {
  level: number;
  statIncreases?: Record<string, number>;
  onClose: () => void;
  autoCloseDelay?: number | null; // null for manual close only
}

/**
 * Full-screen Level Up celebration cinematic
 * Features: Animated particles, stat increases, epic styling
 */
export function LevelUpCinematic({
  level,
  statIncreases = {},
  onClose,
  autoCloseDelay = 5000,
}: LevelUpCinematicProps) {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'exiting'>('entering');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    // Play sound
    playSound('praise');

    // Phase transitions
    const enterTimer = setTimeout(() => {
      setPhase('visible');
    }, 100);

    const statsTimer = setTimeout(() => {
      setShowStats(true);
    }, 800);

    // Auto-close
    let autoCloseTimer: NodeJS.Timeout | null = null;
    if (autoCloseDelay) {
      autoCloseTimer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
    }

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(statsTimer);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
    };
  }, [autoCloseDelay]);

  const handleClose = useCallback(() => {
    setPhase('exiting');
    setTimeout(() => {
      onClose();
    }, 400);
  }, [onClose]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const statEntries = Object.entries(statIncreases);

  return (
    <div
      className={`
        fixed inset-0 z-[10000]
        flex items-center justify-center
        transition-all duration-400
        ${phase === 'entering' ? 'opacity-0' : ''}
        ${phase === 'visible' ? 'opacity-100' : ''}
        ${phase === 'exiting' ? 'opacity-0' : ''}
      `}
      onClick={handleClose}
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />
      
      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="level-up-particles" />
        <div className="level-up-rays" />
      </div>

      {/* Central glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`
          w-[600px] h-[600px] rounded-full
          bg-gradient-radial from-cyan-500/30 via-cyan-500/10 to-transparent
          transition-all duration-1000
          ${phase === 'visible' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
        `} />
      </div>

      {/* Main content */}
      <div
        className={`
          relative z-10
          bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-black/95
          border-4 border-cyan-400/80
          rounded-2xl p-8 md:p-12
          max-w-2xl w-[90%]
          transition-all duration-500
          ${phase === 'visible' ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'}
          shadow-level-up
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div className="absolute -top-1 -left-1 text-cyan-300 text-5xl level-up-corner">◈</div>
        <div className="absolute -top-1 -right-1 text-cyan-300 text-5xl level-up-corner">◈</div>
        <div className="absolute -bottom-1 -left-1 text-cyan-300 text-5xl level-up-corner">◈</div>
        <div className="absolute -bottom-1 -right-1 text-cyan-300 text-5xl level-up-corner">◈</div>

        {/* Header sparkle effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-6xl level-up-sparkle">✦</div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="text-sm font-mono text-cyan-400/60 tracking-[0.5em] mb-2">
            SYSTEM NOTIFICATION
          </div>
          <h1 className="text-5xl md:text-6xl font-rajdhani font-bold tracking-wider level-up-title">
            <span className="text-cyan-400">◈</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-yellow-400 to-cyan-400 mx-4">
              LEVEL UP
            </span>
            <span className="text-cyan-400">◈</span>
          </h1>
        </div>

        {/* Level display */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="text-sm text-slate-500 font-mono tracking-widest mb-2">NEW LEVEL</div>
            <div className={`
              text-8xl md:text-9xl font-rajdhani font-bold text-yellow-400
              transition-all duration-700 delay-300
              ${phase === 'visible' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
              level-number-glow
            `}>
              {level}
            </div>
          </div>
        </div>

        {/* Stat increases */}
        {statEntries.length > 0 && (
          <div className={`
            mb-8 transition-all duration-500 delay-500
            ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <div className="text-center mb-4">
              <p className="text-lg text-slate-300 font-rajdhani tracking-wider">
                ALL BASE STATS INCREASED
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto">
              {statEntries.map(([stat, value], index) => (
                <div
                  key={stat}
                  className="stat-increase-card bg-slate-900/70 border border-cyan-500/30 rounded-lg p-3 text-center"
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{stat}</div>
                  <div className="text-2xl font-rajdhani font-bold text-green-400">
                    +{value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        <p className="text-center text-slate-400 mb-8 font-rajdhani text-lg tracking-wide">
          Your persistent efforts have been acknowledged by the System.
          <br />
          <span className="text-cyan-400">Continue your ascension, Hunter.</span>
        </p>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleClose}
            className="
              px-10 py-4
              bg-gradient-to-r from-cyan-900/60 to-blue-900/60
              border-2 border-cyan-400
              text-cyan-300 font-rajdhani font-bold text-xl
              rounded-lg tracking-[0.2em]
              hover:from-cyan-800/70 hover:to-blue-800/70 
              hover:border-cyan-300 hover:text-cyan-200
              hover:shadow-button-cyan-lg
              transition-all duration-300
              active:scale-[0.98]
            "
          >
            ◇ CONTINUE ◇
          </button>
          {autoCloseDelay && (
            <p className="text-xs text-slate-600 mt-3 font-mono">
              Press ESC or click to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LevelUpCinematic;
