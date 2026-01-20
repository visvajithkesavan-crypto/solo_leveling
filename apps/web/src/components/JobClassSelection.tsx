'use client';

import React, { useState } from 'react';
import { JobClass, JOB_CLASSES, JobClassInfo } from '@solo-leveling/shared';
import { playSound } from '@/lib/sounds';

interface JobClassSelectionProps {
  currentLevel: number;
  currentClass: JobClass;
  onSelectClass: (jobClass: JobClass) => void;
  onClose: () => void;
}

export function JobClassSelection({
  currentLevel,
  currentClass,
  onSelectClass,
  onClose,
}: JobClassSelectionProps) {
  const [selectedClass, setSelectedClass] = useState<JobClass | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const availableClasses = Object.values(JOB_CLASSES).filter(
    (c) => c.id !== JobClass.NONE && currentLevel >= c.unlockLevel
  );

  const lockedClasses = Object.values(JOB_CLASSES).filter(
    (c) => c.id !== JobClass.NONE && currentLevel < c.unlockLevel
  );

  const handleSelect = (jobClass: JobClassInfo) => {
    if (currentLevel < jobClass.unlockLevel) return;
    setSelectedClass(jobClass.id);
    playSound('notification');
  };

  const handleConfirm = () => {
    if (!selectedClass) return;
    
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    playSound('levelup');
    onSelectClass(selectedClass);
  };

  const getRankLetter = (unlockLevel: number): string => {
    if (unlockLevel >= 50) return 'S';
    if (unlockLevel >= 25) return 'A';
    if (unlockLevel >= 15) return 'B';
    return 'E';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 p-8 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-lg shadow-status-window">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-cyan-400 text-sm tracking-[0.5em] mb-2">◇ JOB CHANGE QUEST ◇</div>
          <h2 className="text-3xl font-rajdhani font-bold text-white tracking-wider">
            SELECT YOUR CLASS
          </h2>
          <p className="text-slate-400 mt-2">
            Choose wisely. Your class determines your path.
          </p>
        </div>

        {/* Current Class */}
        {currentClass !== JobClass.NONE && (
          <div className="mb-6 p-4 bg-slate-800/50 border border-slate-600 rounded-lg text-center">
            <span className="text-slate-400">Current Class: </span>
            <span className="text-cyan-400 font-bold">{JOB_CLASSES[currentClass].name}</span>
          </div>
        )}

        {/* Available Classes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {availableClasses.map((jobClass) => (
            <button
              key={jobClass.id}
              onClick={() => handleSelect(jobClass)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 text-left
                ${selectedClass === jobClass.id
                  ? 'border-cyan-400 bg-cyan-900/30 shadow-quest-hover'
                  : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                }
              `}
            >
              {/* Rank Badge */}
              <div 
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded font-bold text-sm"
                style={{ 
                  backgroundColor: `${jobClass.color}20`,
                  borderColor: jobClass.color,
                  color: jobClass.color,
                  borderWidth: '1px'
                }}
              >
                {getRankLetter(jobClass.unlockLevel)}
              </div>

              {/* Icon & Name */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{jobClass.icon}</span>
                <div>
                  <div 
                    className="font-rajdhani font-bold text-lg"
                    style={{ color: jobClass.color }}
                  >
                    {jobClass.name}
                  </div>
                  <div className="text-xs text-slate-500">{jobClass.title}</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-400 mb-3">
                {jobClass.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Primary: <span className="text-cyan-400 uppercase">{jobClass.primaryStat}</span>
                </span>
                <span className="text-green-400">
                  +{Math.round((jobClass.bonusMultiplier - 1) * 100)}% XP Bonus
                </span>
              </div>

              {/* Quest Types */}
              <div className="mt-2 flex flex-wrap gap-1">
                {jobClass.questTypes.slice(0, 3).map((type) => (
                  <span 
                    key={type}
                    className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded"
                  >
                    {type}
                  </span>
                ))}
                {jobClass.questTypes.length > 3 && (
                  <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">
                    +{jobClass.questTypes.length - 3} more
                  </span>
                )}
              </div>

              {/* Selected indicator */}
              {selectedClass === jobClass.id && (
                <div className="absolute inset-0 border-2 border-cyan-400 rounded-lg pointer-events-none animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Locked Classes */}
        {lockedClasses.length > 0 && (
          <div className="mb-6">
            <div className="text-sm text-slate-500 mb-3">◇ LOCKED CLASSES ◇</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {lockedClasses.map((jobClass) => (
                <div
                  key={jobClass.id}
                  className="p-3 rounded-lg border border-slate-700/50 bg-slate-900/50 opacity-50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl grayscale">{jobClass.icon}</span>
                    <span className="text-slate-500 font-bold">{jobClass.name}</span>
                  </div>
                  <div className="text-xs text-red-400/70">
                    🔒 Requires Level {jobClass.unlockLevel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-800 border border-slate-600 text-slate-400 font-rajdhani font-bold rounded-lg tracking-wider hover:border-slate-500 transition-all"
          >
            CANCEL
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedClass}
            className={`px-8 py-3 font-rajdhani font-bold rounded-lg tracking-wider transition-all
              ${selectedClass
                ? isConfirming
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-400 text-white shadow-button-cyan animate-pulse'
                  : 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-2 border-cyan-500 text-cyan-400 hover:border-cyan-400 hover:shadow-button-cyan'
                : 'bg-slate-800 border border-slate-700 text-slate-600 cursor-not-allowed'
              }
            `}
          >
            {isConfirming ? '◇ CONFIRM SELECTION ◇' : '◇ SELECT CLASS ◇'}
          </button>
        </div>

        {/* Confirmation Warning */}
        {isConfirming && (
          <div className="mt-4 text-center text-yellow-400 text-sm animate-pulse">
            ⚠️ This choice defines your path. Click again to confirm.
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
