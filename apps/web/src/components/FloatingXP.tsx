'use client';

import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from 'react';

interface FloatingXPItem {
  id: string;
  amount: number;
  x: number;
  y: number;
  createdAt: number;
}

interface FloatingXPContextValue {
  showFloatingXP: (amount: number, element?: HTMLElement | null) => void;
}

const FloatingXPContext = createContext<FloatingXPContextValue | null>(null);

/**
 * Provider for floating XP numbers system
 */
export function FloatingXPProvider({ children }: { children: ReactNode }) {
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingXPItem[]>([]);

  const showFloatingXP = useCallback((amount: number, element?: HTMLElement | null) => {
    let x: number;
    let y: number;

    if (element) {
      const rect = element.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top;
    } else {
      // Default to center of screen
      x = window.innerWidth / 2;
      y = window.innerHeight / 2;
    }

    const newItem: FloatingXPItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount,
      x,
      y,
      createdAt: Date.now(),
    };

    setFloatingNumbers(prev => [...prev, newItem]);
  }, []);

  const removeFloatingXP = useCallback((id: string) => {
    setFloatingNumbers(prev => prev.filter(item => item.id !== id));
  }, []);

  // Expose globally for easy access
  useEffect(() => {
    (window as any).showFloatingXP = showFloatingXP;
    return () => {
      delete (window as any).showFloatingXP;
    };
  }, [showFloatingXP]);

  return (
    <FloatingXPContext.Provider value={{ showFloatingXP }}>
      {children}
      {/* Render floating numbers */}
      <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
        {floatingNumbers.map(item => (
          <FloatingXPNumber
            key={item.id}
            amount={item.amount}
            x={item.x}
            y={item.y}
            onComplete={() => removeFloatingXP(item.id)}
          />
        ))}
      </div>
    </FloatingXPContext.Provider>
  );
}

/**
 * Hook to show floating XP numbers
 */
export function useFloatingXP() {
  const context = useContext(FloatingXPContext);
  if (!context) {
    // Return a no-op if not wrapped in provider
    return {
      showFloatingXP: (amount: number, element?: HTMLElement | null) => {
        console.warn('FloatingXPProvider not found, floating XP disabled');
      },
    };
  }
  return context;
}

interface FloatingXPNumberProps {
  amount: number;
  x: number;
  y: number;
  onComplete: () => void;
}

/**
 * Individual floating XP number
 */
function FloatingXPNumber({ amount, x, y, onComplete }: FloatingXPNumberProps) {
  const [phase, setPhase] = useState<'entering' | 'floating' | 'exiting'>('entering');
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    // Start floating immediately
    const enterTimer = setTimeout(() => {
      setPhase('floating');
    }, 50);

    // Animate upward
    const floatInterval = setInterval(() => {
      setOffsetY(prev => prev - 2);
    }, 16);

    // Start exit animation
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, 1500);

    // Complete and remove
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(enterTimer);
      clearInterval(floatInterval);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`
        absolute pointer-events-none
        font-rajdhani font-bold text-3xl
        transition-opacity duration-300
        ${phase === 'entering' ? 'opacity-0 scale-50' : ''}
        ${phase === 'floating' ? 'opacity-100 scale-100' : ''}
        ${phase === 'exiting' ? 'opacity-0 scale-110' : ''}
      `}
      style={{
        left: `${x}px`,
        top: `${y + offsetY}px`,
        transform: 'translateX(-50%)',
        textShadow: `
          0 0 10px rgba(251, 191, 36, 0.9),
          0 0 20px rgba(251, 191, 36, 0.6),
          0 0 30px rgba(251, 191, 36, 0.4),
          0 2px 4px rgba(0, 0, 0, 0.8)
        `,
        color: '#fbbf24',
      }}
    >
      +{amount} XP
    </div>
  );
}

/**
 * Floating stat change number (for stat increases)
 */
interface FloatingStatProps {
  stat: string;
  change: number;
  x: number;
  y: number;
  onComplete: () => void;
}

export function FloatingStat({ stat, change, x, y, onComplete }: FloatingStatProps) {
  const [phase, setPhase] = useState<'entering' | 'floating' | 'exiting'>('entering');
  const [offsetY, setOffsetY] = useState(0);
  
  const isPositive = change > 0;
  const color = isPositive ? '#4ade80' : '#f87171';

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('floating'), 50);
    const floatInterval = setInterval(() => setOffsetY(prev => prev - 1.5), 16);
    const exitTimer = setTimeout(() => setPhase('exiting'), 1800);
    const completeTimer = setTimeout(onComplete, 2300);

    return () => {
      clearTimeout(enterTimer);
      clearInterval(floatInterval);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`
        absolute pointer-events-none
        font-rajdhani font-bold text-2xl
        transition-opacity duration-300
        ${phase === 'entering' ? 'opacity-0 scale-50' : ''}
        ${phase === 'floating' ? 'opacity-100 scale-100' : ''}
        ${phase === 'exiting' ? 'opacity-0 scale-110' : ''}
      `}
      style={{
        left: `${x}px`,
        top: `${y + offsetY}px`,
        transform: 'translateX(-50%)',
        textShadow: `0 0 10px ${color}, 0 2px 4px rgba(0, 0, 0, 0.8)`,
        color,
      }}
    >
      {stat} {isPositive ? '+' : ''}{change}
    </div>
  );
}

export default FloatingXPProvider;
