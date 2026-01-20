/**
 * Solo Leveling System - Sound Manager
 * 
 * Generates synthetic futuristic sounds using Web Audio API.
 * No external files required - all sounds are procedurally generated.
 */

export type SoundType = 'notification' | 'complete' | 'levelup' | 'warning' | 'failure' | 'praise';

// Storage keys for preferences
const MUTE_STORAGE_KEY = 'solo-leveling-sound-muted';
const VOLUME_STORAGE_KEY = 'solo-leveling-sound-volume';

// Audio context singleton
let audioContext: AudioContext | null = null;

/**
 * Get or create the AudioContext (lazy initialization)
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  
  // Resume if suspended (required after user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
}

/**
 * Check if sounds are muted
 */
export function isMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
}

/**
 * Set mute preference
 */
export function setMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
}

/**
 * Toggle mute state
 */
export function toggleMute(): boolean {
  const newState = !isMuted();
  setMuted(newState);
  return newState;
}

/**
 * Get global volume multiplier (0-1)
 */
export function getGlobalVolume(): number {
  if (typeof window === 'undefined') return 1;
  const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
  return stored ? parseFloat(stored) : 1;
}

/**
 * Set global volume multiplier (0-1)
 */
export function setGlobalVolume(volume: number): void {
  if (typeof window === 'undefined') return;
  const clampedVolume = Math.max(0, Math.min(1, volume));
  localStorage.setItem(VOLUME_STORAGE_KEY, String(clampedVolume));
}

/**
 * Create an oscillator with envelope
 */
function createTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 1.0
): { osc: OscillatorNode; gain: GainNode } {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  
  // LOUD envelope - quick attack, sustained, quick release
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.setValueAtTime(volume, startTime + duration - 0.02);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(startTime);
  osc.stop(startTime + duration);
  
  return { osc, gain };
}

/**
 * NOTIFICATION - Quick ascending beep (System acknowledgment)
 */
function playNotification(ctx: AudioContext, volume: number): void {
  const now = ctx.currentTime;
  createTone(ctx, 880, now, 0.2, 'sine', volume);
  createTone(ctx, 1200, now + 0.15, 0.25, 'sine', volume);
}

/**
 * COMPLETE - Triumphant ascending chord (Quest completed)
 */
function playComplete(ctx: AudioContext, volume: number): void {
  const now = ctx.currentTime;
  createTone(ctx, 523.25, now, 0.25, 'sine', volume);
  createTone(ctx, 659.25, now + 0.2, 0.25, 'sine', volume);
  createTone(ctx, 783.99, now + 0.4, 0.35, 'sine', volume);
  createTone(ctx, 1046.5, now + 0.6, 0.4, 'sine', volume * 0.8);
}

/**
 * LEVELUP - Epic fanfare (Major achievement)
 */
function playLevelUp(ctx: AudioContext, volume: number): void {
  const now = ctx.currentTime;
  createTone(ctx, 261.63, now, 0.3, 'sawtooth', volume * 0.7);
  createTone(ctx, 329.63, now, 0.3, 'sawtooth', volume * 0.6);
  createTone(ctx, 392.0, now + 0.25, 0.3, 'sawtooth', volume * 0.7);
  createTone(ctx, 523.25, now + 0.5, 0.45, 'sawtooth', volume * 0.8);
  createTone(ctx, 659.25, now + 0.5, 0.45, 'sawtooth', volume * 0.7);
  createTone(ctx, 1046.5, now + 0.75, 0.5, 'sine', volume);
  createTone(ctx, 1318.5, now + 0.8, 0.5, 'sine', volume * 0.8);
}

/**
 * WARNING - Urgent pulsing tone (Attention required)
 */
function playWarning(ctx: AudioContext, volume: number): void {
  const now = ctx.currentTime;
  createTone(ctx, 440, now, 0.2, 'square', volume * 0.6);
  createTone(ctx, 349.23, now + 0.2, 0.2, 'square', volume * 0.6);
  createTone(ctx, 440, now + 0.45, 0.2, 'square', volume * 0.6);
  createTone(ctx, 349.23, now + 0.65, 0.2, 'square', volume * 0.6);
}

/**
 * FAILURE - Heavy descending tone (Judgment/penalty)
 */
function playFailure(ctx: AudioContext, volume: number): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(500, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.8);
  
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + 0.8);
  
  createTone(ctx, 120, now, 0.7, 'sine', volume);
}

/**
 * Play a sound effect using Web Audio API
 * 
 * @param soundType - The type of sound to play
 * @param volume - Optional volume override (0-1), defaults to 1.0
 */
export function playSound(soundType: SoundType, volume?: number): Promise<void> {
  return new Promise((resolve) => {
    // Check if muted
    if (isMuted()) {
      resolve();
      return;
    }

    const ctx = getAudioContext();
    if (!ctx) {
      resolve();
      return;
    }

    const finalVolume = (volume ?? 1.0) * getGlobalVolume();

    try {
      switch (soundType) {
        case 'notification':
          playNotification(ctx, finalVolume);
          break;
        case 'complete':
          playComplete(ctx, finalVolume);
          break;
        case 'levelup':
          playLevelUp(ctx, finalVolume);
          break;
        case 'warning':
          playWarning(ctx, finalVolume);
          break;
        case 'failure':
          playFailure(ctx, finalVolume);
          break;
        case 'praise':
          // Praise sound - similar to level up but more triumphant
          playLevelUp(ctx, finalVolume);
          break;
      }
      resolve();
    } catch (e) {
      console.warn('Failed to play sound:', e);
      resolve();
    }
  });
}

/**
 * Play sound for specific System message types
 */
export function playSoundForMessageType(
  messageType: 'command' | 'warning' | 'praise' | 'judgment' | 'notification'
): Promise<void> {
  const soundMap: Record<string, SoundType> = {
    command: 'notification',
    warning: 'warning',
    praise: 'complete',
    judgment: 'failure',
    notification: 'notification',
  };
  
  return playSound(soundMap[messageType]);
}

/**
 * Stop all sounds (cleanup function)
 */
export function stopSound(): void {
  // With Web Audio API, sounds auto-stop after their duration
  // This function exists for API compatibility
}

/**
 * Initialize audio on first user interaction
 * Call this on a click/touch event to ensure audio works
 */
export function initAudio(): void {
  getAudioContext();
}
