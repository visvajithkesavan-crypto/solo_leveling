'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Hook to animate numeric value changes
 * Useful for XP, stats, counters with smooth transitions
 */
export function useAnimatedValue(
  targetValue: number,
  duration: number = 1000,
  enabled: boolean = true
): number {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const animationRef = useRef<number | null>(null);
  const startValueRef = useRef(targetValue);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCurrentValue(targetValue);
      return;
    }

    if (currentValue === targetValue) return;

    startValueRef.current = currentValue;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const difference = targetValue - startValueRef.current;
      const newValue = startValueRef.current + (difference * eased);
      setCurrentValue(newValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentValue(targetValue);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, enabled]);

  return Math.floor(currentValue);
}

/**
 * Hook for animating multiple values at once
 */
export function useAnimatedValues<T extends Record<string, number>>(
  targetValues: T,
  duration: number = 1000,
  enabled: boolean = true
): T {
  const [currentValues, setCurrentValues] = useState<T>(targetValues);
  const animationRef = useRef<number | null>(null);
  const startValuesRef = useRef<T>(targetValues);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCurrentValues(targetValues);
      return;
    }

    const hasChanges = Object.keys(targetValues).some(
      key => targetValues[key] !== currentValues[key]
    );

    if (!hasChanges) return;

    startValuesRef.current = { ...currentValues };
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const newValues = {} as T;
      for (const key of Object.keys(targetValues)) {
        const start = startValuesRef.current[key];
        const target = targetValues[key];
        newValues[key as keyof T] = Math.floor(start + (target - start) * eased) as T[keyof T];
      }

      setCurrentValues(newValues);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentValues(targetValues);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValues, duration, enabled]);

  return currentValues;
}
