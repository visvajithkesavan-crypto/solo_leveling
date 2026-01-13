'use client';

import { ReactNode } from 'react';

interface SystemWindowProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * System Window - Main UI wrapper component
 * Provides the signature Solo Leveling system window look
 */
export function SystemWindow({ title, children, className = '' }: SystemWindowProps) {
  return (
    <div className={`system-window p-6 ${className}`}>
      <div className="border-b border-system-border pb-4 mb-6">
        <h2 className="system-title">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}

interface StatusBarProps {
  label: string;
  value: string | number;
  maxValue?: string | number;
  color?: 'gold' | 'mana' | 'border';
}

/**
 * Status Bar - Shows stats like HP, MP, etc.
 */
export function StatusBar({ label, value, maxValue, color = 'border' }: StatusBarProps) {
  const colorClass = {
    gold: 'bg-system-gold',
    mana: 'bg-system-mana',
    border: 'bg-system-border',
  }[color];

  const percentage = maxValue ? (Number(value) / Number(maxValue)) * 100 : 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-system">{label}</span>
        <span>
          {value}
          {maxValue && ` / ${maxValue}`}
        </span>
      </div>
      {maxValue && (
        <div className="h-2 bg-system-bg border border-system-border rounded overflow-hidden">
          <div
            className={`h-full ${colorClass} transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface QuestCardProps {
  title: string;
  description?: string;
  difficulty?: string;
  createdAt: string;
  onDelete?: () => void;
}

/**
 * Quest Card - Individual quest/goal display
 */
export function QuestCard({ title, description, difficulty, createdAt, onDelete }: QuestCardProps) {
  return (
    <div className="quest-item">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-system-gold">{title}</h3>
        {difficulty && (
          <span className="text-xs px-2 py-1 bg-system-border rounded font-system">
            {difficulty}
          </span>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-system-text opacity-75 mb-3">{description}</p>
      )}
      
      <div className="flex justify-between items-center text-xs opacity-50">
        <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
