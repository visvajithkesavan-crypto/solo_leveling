# 🎨 DAY 2 VISUAL BLUEPRINT - Solo Leveling UI Transformation

**Target:** Transform the app to match Solo Leveling's signature blue holographic aesthetic  
**Estimated Time:** 6-8 hours focused work  
**Prerequisite:** System Message Framework working (Day 1 complete)

---

## 🎯 TRANSFORMATION OVERVIEW

### Visual Goals
Transform from basic dashboard → Immersive Solo Leveling experience

**Key Visual Elements:**
1. **Blue holographic windows** with layered glow borders
2. **Animated quest cards** with hover effects and particles
3. **Smooth XP/stat animations** with number countups
4. **Cinematic level-up sequence** (full-screen overlay)
5. **Status window redesign** matching manhwa style
6. **Dark theme** with neon blue/cyan accents
7. **Floating XP numbers** when actions complete
8. **Quest completion effects** (particles, flash)

### Color Palette

```css
/* Primary Blues (Holographic) */
--system-blue-primary: #0ea5e9;    /* Bright cyan-blue */
--system-blue-glow: #22d3ee;       /* Neon cyan */
--system-blue-dark: #0c4a6e;       /* Deep blue */
--system-blue-light: #7dd3fc;      /* Light cyan */

/* Accent Colors */
--system-gold: #fbbf24;            /* Quest rewards, XP */
--system-orange: #fb923c;          /* Warnings, deadlines */
--system-green: #4ade80;           /* Success, health */
--system-red: #f87171;             /* Danger, penalties */

/* Background Layers */
--system-bg-primary: #0a0e27;      /* Darkest background */
--system-bg-secondary: #1e293b;    /* Window backgrounds */
--system-bg-tertiary: #334155;     /* Card backgrounds */

/* Text */
--system-text-primary: #f1f5f9;    /* Main text */
--system-text-secondary: #94a3b8;  /* Dimmed text */
--system-text-muted: #64748b;      /* Very dimmed */
```

### Typography

```css
/* Headings - Rajdhani (already installed) */
--font-heading: 'Rajdhani', sans-serif;
font-weight: 700; /* Bold for titles */
letter-spacing: 0.05em; /* Slight tracking */

/* Body - Inter (already installed) */
--font-body: 'Inter', sans-serif;
font-weight: 400;

/* System Text - Monospace for data */
--font-mono: 'Courier New', monospace;
```

---

## 📅 DAY 2 SCHEDULE

### Morning Session (3-4 hours)
- **9:00 - 10:30** → Task 1: Quest Card Redesign
- **10:30 - 12:00** → Task 2: Status Window Redesign
- **12:00 - 13:00** → Lunch Break

### Afternoon Session (3-4 hours)
- **13:00 - 14:30** → Task 3: XP Bar Animation
- **14:30 - 16:00** → Task 4: Level-Up Cinematic
- **16:00 - 17:00** → Task 5: Floating Numbers & Polish
- **17:00 - 17:30** → Testing & Refinement

---

## 🏗️ TASK 1: QUEST CARD REDESIGN (90 min)

### Current State
Basic card with title, description, difficulty tag, delete button

### Target State
Holographic card with:
- ✨ Blue glowing border (animated pulse)
- 🎨 Gradient background (dark → darker)
- ⚡ Hover effect (border intensifies, card lifts)
- 📊 Progress indicator (if applicable)
- 🎯 Quest type icon
- ⚙️ Action buttons (Complete, Delete) with System voice

### Visual Specification

```
┌─────────────────────────────────────────────────┐
│  ◈                                              │ ← Animated corner accent
│     [D] COMPLETE 100 PUSHUPS                    │ ← Difficulty badge + Title
│                                                  │
│     Objective: Physical training to increase    │ ← Description
│     base strength stat.                         │
│                                                  │
│     ▓▓▓▓▓▓▓▓░░░░  Progress: 60/100 reps        │ ← Progress bar (if tracked)
│                                                  │
│     Registered: Jan 15, 2026                    │ ← Metadata
│                                                  │
│                 [◇ COMPLETE] [◇ REMOVE]        │ ← Action buttons
└─────────────────────────────────────────────────┘
  ↑ Blue glow with subtle pulse animation
```

**Colors:**
- Border: Cyan (#22d3ee) with glow
- Background: Dark gradient (#1e293b → #0f172a)
- Title: Gold (#fbbf24)
- Difficulty badge: Blue (#0ea5e9)
- Progress bar: Cyan fill (#22d3ee)

### Complete Component Code

**File:** [apps/web/src/components/QuestCard.tsx](apps/web/src/components/QuestCard.tsx)

```tsx
'use client';

import { useState } from 'react';
import { Goal } from '@solo-leveling/shared';

interface QuestCardProps {
  goal: Goal;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function QuestCard({ goal, onComplete, onDelete }: QuestCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    await onComplete?.(goal.id);
    // Animation handled by parent
  };

  // Calculate difficulty color
  const difficultyConfig = {
    easy: { color: 'text-green-400', border: 'border-green-500', bg: 'bg-green-900/30' },
    medium: { color: 'text-cyan-400', border: 'border-cyan-500', bg: 'bg-cyan-900/30' },
    hard: { color: 'text-orange-400', border: 'border-orange-500', bg: 'bg-orange-900/30' },
    extreme: { color: 'text-red-400', border: 'border-red-500', bg: 'bg-red-900/30' },
  };

  const difficulty = goal.difficulty || 'medium';
  const diffStyle = difficultyConfig[difficulty as keyof typeof difficultyConfig];

  return (
    <div
      className={`
        quest-card relative
        bg-gradient-to-br from-slate-800/90 to-slate-900/90
        border-2 border-cyan-500/50
        rounded-lg p-6
        transition-all duration-300
        ${isHovered ? 'border-cyan-400 shadow-quest-hover translate-y-[-4px]' : 'shadow-quest'}
        ${isCompleting ? 'opacity-50 pointer-events-none' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated corner accent */}
      <div className="absolute top-0 left-0 w-8 h-8">
        <div className="quest-corner-accent">◈</div>
      </div>

      {/* Difficulty Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`
                text-xs px-2.5 py-1 rounded font-rajdhani font-bold
                ${diffStyle.bg} ${diffStyle.border} ${diffStyle.color}
                border tracking-wider
              `}
            >
              [{difficulty[0].toUpperCase()}]
            </span>
          </div>

          {/* Quest Title */}
          <h3 className="text-xl font-rajdhani font-bold text-yellow-400 tracking-wide leading-tight">
            {goal.title.toUpperCase()}
          </h3>
        </div>
      </div>

      {/* Quest Description */}
      {goal.description && (
        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          {goal.description}
        </p>
      )}

      {/* Progress Bar (if quest has progress tracking) */}
      {goal.progress !== undefined && goal.target && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-rajdhani">PROGRESS</span>
            <span className="font-mono">{goal.progress} / {goal.target}</span>
          </div>
          <div className="h-2 bg-slate-900 border border-cyan-500/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 shadow-progress"
              style={{ width: `${(goal.progress / goal.target) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="flex justify-between items-center text-xs text-slate-500 mb-4 font-mono">
        <span>REGISTERED: {new Date(goal.createdAt).toLocaleDateString()}</span>
        {goal.xpReward && (
          <span className="text-yellow-500">+{goal.xpReward} XP</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onComplete && (
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="
              flex-1 py-2 px-4
              bg-cyan-900/40 border border-cyan-500
              text-cyan-400 font-rajdhani font-semibold text-sm
              rounded tracking-wider
              hover:bg-cyan-800/60 hover:border-cyan-400
              transition-all duration-200
              hover:shadow-button
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isCompleting ? '◇ PROCESSING...' : '◇ COMPLETE'}
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(goal.id)}
            className="
              py-2 px-4
              bg-red-900/40 border border-red-500/50
              text-red-400 font-rajdhani font-semibold text-sm
              rounded tracking-wider
              hover:bg-red-800/60 hover:border-red-400
              transition-all duration-200
              hover:shadow-button-red
            "
          >
            ◇ REMOVE
          </button>
        )}
      </div>
    </div>
  );
}
```

### CSS Additions

**File:** [apps/web/src/styles/system.css](apps/web/src/styles/system.css)

Add these classes:

```css
/* Quest Card Shadows */
.shadow-quest {
  box-shadow: 
    0 0 20px rgba(34, 211, 238, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.5);
}

.shadow-quest-hover {
  box-shadow: 
    0 0 30px rgba(34, 211, 238, 0.5),
    0 0 60px rgba(34, 211, 238, 0.2),
    0 8px 20px rgba(0, 0, 0, 0.6);
}

.shadow-button {
  box-shadow: 
    0 0 15px rgba(34, 211, 238, 0.4),
    inset 0 0 10px rgba(34, 211, 238, 0.1);
}

.shadow-button-red {
  box-shadow: 
    0 0 15px rgba(248, 113, 113, 0.4),
    inset 0 0 10px rgba(248, 113, 113, 0.1);
}

/* Progress Bar Glow */
.shadow-progress {
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.6);
}

/* Corner Accent Animation */
.quest-corner-accent {
  color: #22d3ee;
  font-size: 1.25rem;
  animation: cornerPulse 2s ease-in-out infinite;
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.8);
}

@keyframes cornerPulse {
  0%, 100% { 
    opacity: 0.6;
    text-shadow: 0 0 10px rgba(34, 211, 238, 0.6);
  }
  50% { 
    opacity: 1;
    text-shadow: 0 0 20px rgba(34, 211, 238, 1);
  }
}

/* Quest Card Transition */
.quest-card {
  transform-origin: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Tailwind Config Update

**File:** [apps/web/tailwind.config.js](apps/web/tailwind.config.js)

Add font family:

```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        rajdhani: ['var(--font-rajdhani)', 'sans-serif'],
      },
    },
  },
};
```

### Integration in Dashboard

**File:** [apps/web/src/app/dashboard/page.tsx](apps/web/src/app/dashboard/page.tsx)

Update quest rendering:

```tsx
import { QuestCard } from '@/components/QuestCard';

// In render:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {goals.map((goal) => (
    <QuestCard
      key={goal.id}
      goal={goal}
      onComplete={handleCompleteQuest}
      onDelete={handleDeleteQuest}
    />
  ))}
</div>
```

---

## 🎯 TASK 2: STATUS WINDOW REDESIGN (90 min)

### Current State
Basic stats display with level, XP, streak

### Target State
Manhwa-style status window with:
- **Profile section** (Hunter name, rank, level)
- **XP bar** with animated fill and glow
- **Stat grid** (Strength, Agility, Intelligence, etc.)
- **Streak display** with flame icon
- **Holographic border** with corner accents

### Visual Specification

```
╔═══════════════════════════════════════════════╗
║  ◈ HUNTER STATUS ◈                           ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  NAME: SUNG JINWOO          LEVEL: 42         ║
║  RANK: E → S               CLASS: MONARCH     ║
║                                               ║
║  ▓▓▓▓▓▓▓▓▓▓▓░░░░░   XP: 8,450 / 10,000      ║
║                                               ║
║  ┌─────────────────┐  ┌─────────────────┐   ║
║  │ STR: 156 (+2)   │  │ AGI: 142 (+1)   │   ║
║  └─────────────────┘  └─────────────────┘   ║
║  ┌─────────────────┐  ┌─────────────────┐   ║
║  │ INT: 138 (+3)   │  │ VIT: 150 (+2)   │   ║
║  └─────────────────┘  └─────────────────┘   ║
║                                               ║
║  🔥 DAILY STREAK: 14 DAYS     BEST: 30       ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

### Complete Component Code

**Create:** [apps/web/src/components/StatusWindowCard.tsx](apps/web/src/components/StatusWindowCard.tsx)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { StatusWindow } from '@solo-leveling/shared';

interface StatusWindowCardProps {
  data: StatusWindow;
  userName?: string;
}

export function StatusWindowCard({ data, userName = 'HUNTER' }: StatusWindowCardProps) {
  const [animatedXP, setAnimatedXP] = useState(data.xp);

  // Animate XP changes
  useEffect(() => {
    if (animatedXP !== data.xp) {
      const step = (data.xp - animatedXP) / 20;
      const interval = setInterval(() => {
        setAnimatedXP(prev => {
          const next = prev + step;
          if ((step > 0 && next >= data.xp) || (step < 0 && next <= data.xp)) {
            clearInterval(interval);
            return data.xp;
          }
          return next;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [data.xp, animatedXP]);

  const xpPercentage = (animatedXP / data.xpToNext) * 100;
  const isNearLevelUp = xpPercentage > 90;

  return (
    <div className="status-window bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500 rounded-lg p-6 shadow-quest">
      {/* Header */}
      <div className="border-b border-cyan-500/30 pb-4 mb-6">
        <h2 className="text-2xl font-rajdhani font-bold text-cyan-400 tracking-wider text-center">
          ◈ HUNTER STATUS ◈
        </h2>
      </div>

      {/* Profile Section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-xs text-slate-500 font-mono mb-1">NAME</div>
          <div className="text-lg font-rajdhani font-bold text-yellow-400">
            {userName.toUpperCase()}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 font-mono mb-1">LEVEL</div>
          <div className="text-3xl font-rajdhani font-bold text-cyan-400">
            {data.level}
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono">
          <span>EXPERIENCE POINTS</span>
          <span className="text-yellow-400">
            {Math.floor(animatedXP).toLocaleString()} / {data.xpToNext.toLocaleString()}
          </span>
        </div>
        <div className="relative h-6 bg-slate-900 border-2 border-cyan-500/40 rounded-lg overflow-hidden">
          <div
            className={`
              absolute inset-y-0 left-0
              bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-500
              transition-all duration-500 ease-out
              ${isNearLevelUp ? 'animate-pulse-glow' : ''}
            `}
            style={{ width: `${xpPercentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
          </div>
          
          {/* Percentage Text */}
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-lg">
            {xpPercentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="STR" value={data.stats?.strength || 0} change={data.recentChanges?.strength} />
        <StatCard label="AGI" value={data.stats?.agility || 0} change={data.recentChanges?.agility} />
        <StatCard label="INT" value={data.stats?.intelligence || 0} change={data.recentChanges?.intelligence} />
        <StatCard label="VIT" value={data.stats?.vitality || 0} change={data.recentChanges?.vitality} />
      </div>

      {/* Streak Display */}
      <div className="flex items-center justify-between bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-xs text-slate-500 font-mono">DAILY STREAK</div>
            <div className="text-xl font-rajdhani font-bold text-orange-400">
              {data.streak} DAYS
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 font-mono">RECORD</div>
          <div className="text-lg font-rajdhani font-bold text-yellow-400">
            {data.bestStreak}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  change?: number;
}

function StatCard({ label, value, change }: StatCardProps) {
  const changeColor = change ? (change > 0 ? 'text-green-400' : 'text-red-400') : '';
  const changeSign = change && change > 0 ? '+' : '';

  return (
    <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-3 hover:border-cyan-500/60 transition-colors">
      <div className="text-xs text-slate-500 font-mono mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-rajdhani font-bold text-cyan-300">
          {value}
        </span>
        {change !== undefined && change !== 0 && (
          <span className={`text-sm font-mono ${changeColor} animate-fade-in`}>
            ({changeSign}{change})
          </span>
        )}
      </div>
    </div>
  );
}
```

### CSS Additions

```css
/* XP Bar Pulse Glow (near level up) */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 
      inset 0 0 20px rgba(34, 211, 238, 0.6),
      0 0 20px rgba(34, 211, 238, 0.4);
  }
  50% {
    box-shadow: 
      inset 0 0 30px rgba(34, 211, 238, 0.9),
      0 0 30px rgba(34, 211, 238, 0.6);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Stat Change Fade In */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
```

---

## ⚡ TASK 3: XP BAR ANIMATION (90 min)

### Goal
Make XP gains feel rewarding with smooth animations

### Features
1. **Number countup** when XP increases
2. **Bar fills smoothly** (not instant jump)
3. **Pulse glow** when near level-up (>90% XP)
4. **Overflow handling** when XP exceeds max
5. **Sound effect** on XP gain (optional)

### Implementation

Already included in StatusWindowCard above, but here's the standalone animation logic:

**File:** [apps/web/src/hooks/useAnimatedValue.ts](apps/web/src/hooks/useAnimatedValue.ts)

```tsx
'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to animate numeric value changes
 * Useful for XP, stats, counters
 */
export function useAnimatedValue(
  targetValue: number,
  duration: number = 1000,
  enabled: boolean = true
) {
  const [currentValue, setCurrentValue] = useState(targetValue);

  useEffect(() => {
    if (!enabled || currentValue === targetValue) return;

    const startValue = currentValue;
    const difference = targetValue - startValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const newValue = startValue + (difference * eased);
      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentValue(targetValue);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration, enabled, currentValue]);

  return Math.floor(currentValue);
}
```

### Usage Example

```tsx
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

function XPDisplay({ xp, maxXP }: { xp: number; maxXP: number }) {
  const animatedXP = useAnimatedValue(xp, 1000);
  
  return (
    <div>
      {animatedXP.toLocaleString()} / {maxXP.toLocaleString()}
    </div>
  );
}
```

---

## 🎬 TASK 4: LEVEL-UP CINEMATIC (90 min)

### Goal
Create a full-screen celebratory animation when player levels up

### Visual Specification

```
[FULL SCREEN OVERLAY]
╔═══════════════════════════════════════════════╗
║                                               ║
║                                               ║
║              ◈ LEVEL UP! ◈                   ║
║                                               ║
║                  Level 43                     ║
║                                               ║
║           ALL STATS INCREASED                 ║
║                                               ║
║         STR +5    AGI +4                     ║
║         INT +3    VIT +5                     ║
║                                               ║
║              [◇ CONTINUE]                     ║
║                                               ║
╚═══════════════════════════════════════════════╝

Animation: Particles, glow, rays of light
Duration: 3-5 seconds (auto-dismiss or manual)
```

### Complete Component Code

**Create:** [apps/web/src/components/LevelUpCinematic.tsx](apps/web/src/components/LevelUpCinematic.tsx)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { playSound } from '@/lib/sounds';

interface LevelUpCinematicProps {
  level: number;
  statIncreases?: Record<string, number>;
  onClose: () => void;
  autoCloseDelay?: number; // milliseconds, or null for manual close
}

export function LevelUpCinematic({
  level,
  statIncreases = {},
  onClose,
  autoCloseDelay = 4000,
}: LevelUpCinematicProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Play sound and show animation
    playSound('praise');
    setVisible(true);

    // Auto-close timer
    if (autoCloseDelay) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoCloseDelay]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // Wait for fade-out
  };

  return (
    <div
      className={`
        fixed inset-0 z-[10000]
        bg-black/90 backdrop-blur-md
        flex items-center justify-center
        transition-opacity duration-300
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleClose}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="level-up-particles" />
      </div>

      {/* Main content */}
      <div
        className={`
          relative z-10
          bg-gradient-to-br from-slate-800 via-slate-900 to-black
          border-4 border-cyan-400
          rounded-xl p-12
          max-w-2xl w-full mx-4
          transition-all duration-500
          ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          shadow-level-up
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 text-cyan-400 text-4xl corner-accent">◈</div>
        <div className="absolute top-0 right-0 text-cyan-400 text-4xl corner-accent">◈</div>
        <div className="absolute bottom-0 left-0 text-cyan-400 text-4xl corner-accent">◈</div>
        <div className="absolute bottom-0 right-0 text-cyan-400 text-4xl corner-accent">◈</div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-rajdhani font-bold text-cyan-400 tracking-wider mb-2 animate-pulse-slow">
            ◈ LEVEL UP! ◈
          </h1>
          <div className="text-8xl font-rajdhani font-bold text-yellow-400 mt-4 animate-scale-in">
            {level}
          </div>
        </div>

        {/* Stat Increases */}
        <div className="text-center mb-8">
          <p className="text-xl text-slate-300 font-rajdhani mb-6">
            ALL BASE STATS INCREASED
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {Object.entries(statIncreases).map(([stat, value], index) => (
              <div
                key={stat}
                className="stat-increase bg-slate-900/50 border border-cyan-500/30 rounded-lg p-3"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-sm text-slate-400 font-mono uppercase">{stat}</div>
                <div className="text-2xl font-rajdhani font-bold text-green-400">
                  +{value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleClose}
            className="
              px-8 py-3
              bg-cyan-900/40 border-2 border-cyan-400
              text-cyan-400 font-rajdhani font-bold text-lg
              rounded-lg tracking-widest
              hover:bg-cyan-800/60 hover:border-cyan-300
              transition-all duration-200
              hover:shadow-button
              animate-fade-in
            "
            style={{ animationDelay: '0.5s' }}
          >
            ◇ CONTINUE
          </button>
          {autoCloseDelay && (
            <p className="text-xs text-slate-500 mt-3 font-mono">
              Auto-closing in {(autoCloseDelay / 1000).toFixed(0)}s...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

### CSS Additions

```css
/* Level Up Shadow */
.shadow-level-up {
  box-shadow: 
    0 0 60px rgba(34, 211, 238, 0.6),
    0 0 120px rgba(34, 211, 238, 0.3),
    inset 0 0 40px rgba(34, 211, 238, 0.1);
}

/* Corner Accent Animation */
.corner-accent {
  animation: cornerGlow 2s ease-in-out infinite;
}

@keyframes cornerGlow {
  0%, 100% {
    opacity: 0.6;
    filter: drop-shadow(0 0 10px rgba(34, 211, 238, 0.6));
  }
  50% {
    opacity: 1;
    filter: drop-shadow(0 0 20px rgba(34, 211, 238, 1));
  }
}

/* Pulse Slow */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.9;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

/* Scale In Animation */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Stat Increase Stagger */
.stat-increase {
  opacity: 0;
  animation: fade-slide-up 0.5s ease-out forwards;
}

@keyframes fade-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Background Particles */
.level-up-particles {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, rgba(34, 211, 238, 0.8), transparent),
    radial-gradient(2px 2px at 60% 70%, rgba(96, 165, 250, 0.8), transparent),
    radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(2px 2px at 80% 10%, rgba(34, 211, 238, 0.8), transparent),
    radial-gradient(1px 1px at 90% 60%, rgba(255, 255, 255, 0.6), transparent);
  background-size: 200% 200%;
  animation: particles 20s linear infinite;
}

@keyframes particles {
  0% {
    background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%;
  }
  100% {
    background-position: 200% 200%, -200% -200%, 100% 100%, -100% -100%, 150% 150%;
  }
}
```

### Integration in Dashboard

```tsx
// apps/web/src/app/dashboard/page.tsx

import { LevelUpCinematic } from '@/components/LevelUpCinematic';

export default function Dashboard() {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ level: 1, stats: {} });

  // Detect level up
  useEffect(() => {
    if (previousLevel !== null && statusWindow.level > previousLevel) {
      setLevelUpData({
        level: statusWindow.level,
        stats: {
          STR: 5,
          AGI: 4,
          INT: 3,
          VIT: 5,
        },
      });
      setShowLevelUp(true);
    }
    setPreviousLevel(statusWindow.level);
  }, [statusWindow.level, previousLevel]);

  return (
    <div>
      {/* Existing dashboard content */}

      {/* Level Up Cinematic */}
      {showLevelUp && (
        <LevelUpCinematic
          level={levelUpData.level}
          statIncreases={levelUpData.stats}
          onClose={() => setShowLevelUp(false)}
          autoCloseDelay={4000}
        />
      )}
    </div>
  );
}
```

---

## 🎈 TASK 5: FLOATING XP NUMBERS (60 min)

### Goal
Show "+XP" floating numbers when actions complete

### Visual Effect
```
         +50 XP ↑
      +50 XP ↑
   +50 XP ↑  (fades and floats up)
Quest Card
```

### Component Code

**Create:** [apps/web/src/components/FloatingXP.tsx](apps/web/src/components/FloatingXP.tsx)

```tsx
'use client';

import { useEffect, useState } from 'react';

interface FloatingXPProps {
  amount: number;
  x: number; // Position X (pixels from left)
  y: number; // Position Y (pixels from top)
  onComplete: () => void;
}

export function FloatingXP({ amount, x, y, onComplete }: FloatingXPProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`
        fixed z-[9999] pointer-events-none
        font-rajdhani font-bold text-3xl
        text-yellow-400
        transition-all duration-2000
        ${visible ? 'floating-xp-visible' : 'floating-xp-hidden'}
      `}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        textShadow: '0 0 10px rgba(251, 191, 36, 0.8), 0 0 20px rgba(251, 191, 36, 0.4)',
      }}
    >
      +{amount} XP
    </div>
  );
}

// Container for managing multiple floating numbers
export function FloatingXPContainer() {
  const [floatingNumbers, setFloatingNumbers] = useState<Array<{
    id: string;
    amount: number;
    x: number;
    y: number;
  }>>([]);

  // Expose function to add floating number
  useEffect(() => {
    (window as any).showFloatingXP = (amount: number, element?: HTMLElement) => {
      const rect = element?.getBoundingClientRect() || { left: window.innerWidth / 2, top: window.innerHeight / 2 };
      
      setFloatingNumbers(prev => [...prev, {
        id: Date.now().toString(),
        amount,
        x: rect.left + (rect.width || 0) / 2,
        y: rect.top,
      }]);
    };

    return () => {
      delete (window as any).showFloatingXP;
    };
  }, []);

  const handleComplete = (id: string) => {
    setFloatingNumbers(prev => prev.filter(item => item.id !== id));
  };

  return (
    <>
      {floatingNumbers.map(item => (
        <FloatingXP
          key={item.id}
          amount={item.amount}
          x={item.x}
          y={item.y}
          onComplete={() => handleComplete(item.id)}
        />
      ))}
    </>
  );
}
```

### CSS

```css
/* Floating XP Animation */
.floating-xp-visible {
  opacity: 1;
  transform: translateY(0);
}

.floating-xp-hidden {
  opacity: 0;
  transform: translateY(-100px);
}

/* Add smooth transition */
.floating-xp-visible,
.floating-xp-hidden {
  transition: all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### Integration

**Add to layout.tsx:**

```tsx
import { FloatingXPContainer } from '@/components/FloatingXP';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <SystemMessageProvider>
            {children}
            <SystemMessageDisplay />
            <FloatingXPContainer />
          </SystemMessageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Trigger when quest completes:**

```tsx
const handleCompleteQuest = async (id: string) => {
  const questElement = document.getElementById(`quest-${id}`);
  
  // Trigger floating XP
  if ((window as any).showFloatingXP) {
    (window as any).showFloatingXP(50, questElement);
  }

  // Complete quest via API
  await apiClient.completeQuest(id);
};
```

---

## ✨ FINAL POLISH CHECKLIST

After completing all tasks:

- [ ] All quest cards have holographic borders
- [ ] Quest cards animate on hover (lift + glow)
- [ ] Status window displays with proper styling
- [ ] XP bar animates smoothly
- [ ] XP bar glows when near level-up (>90%)
- [ ] Level-up cinematic appears full-screen
- [ ] Stat increases display in cinematic
- [ ] Floating +XP numbers appear on quest complete
- [ ] All buttons use System voice text
- [ ] Colors match palette (cyan, gold, slate)
- [ ] Font is Rajdhani for headings
- [ ] Animations are smooth (no jank)
- [ ] Mobile responsive
- [ ] Dark theme consistent throughout

---

## 🎨 TESTING YOUR TRANSFORMATION

### Visual Comparison Test

**Before (Day 1):**
- Basic dashboard with plain cards
- Simple text and buttons
- No animations
- Generic colors

**After (Day 2):**
- Holographic quest cards with glow
- Animated XP bar with pulse
- Cinematic level-up sequence
- Floating XP numbers
- System voice throughout
- Solo Leveling aesthetic

### User Experience Test

1. **Create a quest** → Should feel like System is registering it
2. **Complete a quest** → Floating XP + message + smooth XP fill
3. **Near level-up** → XP bar should pulse (exciting!)
4. **Level up** → Full-screen cinematic (epic moment!)
5. **View status** → Feels like checking a game character sheet

---

## 📈 PERFORMANCE OPTIMIZATION

### Animation Performance

**Use CSS transforms** (GPU accelerated):
```css
/* ✅ GOOD */
transform: translateY(-10px);
opacity: 0.5;

/* ❌ AVOID */
margin-top: -10px;
height: 100px; /* animating height is slow */
```

### Lazy Loading

For cinematic component (since it's not always visible):

```tsx
import dynamic from 'next/dynamic';

const LevelUpCinematic = dynamic(() => import('@/components/LevelUpCinematic'), {
  ssr: false,
});
```

---

## 🎯 SUCCESS METRICS

Day 2 is complete when:

1. ✅ Visual transformation matches Solo Leveling style
2. ✅ All animations smooth (60 FPS)
3. ✅ User feels "wow, this looks amazing!"
4. ✅ Mobile works well
5. ✅ No performance issues

---

## 🚀 BEYOND DAY 2

**Future enhancements:**
- **Sound effects** for XP gain (cha-ching)
- **Particle effects** on quest complete (sparks, stars)
- **Daily quest timer** (countdown)
- **Achievement badges** with unlock animations
- **Stat comparison** (hover to see previous values)
- **Quest difficulty badges** with icons
- **Hunter rank progression** (E → D → C → B → A → S)
- **Skills tree visualization**

**Day 3 possibilities:**
- Mobile app integration
- Real-time notifications
- Social features (leaderboards)
- Quest templates library
- Analytics dashboard

---

**Ready to begin? Start with Task 1 and work through sequentially. Each task builds on the previous. Take breaks between tasks. You've got this, Hunter! 💪**
