/**
 * Solo Leveling System - Health Data Integration Service
 * 
 * Integrates with Terra API for automatic health data tracking
 * Terra supports: Apple Health, Google Fit, Fitbit, Garmin, Oura, WHOOP, etc.
 */

import { Injectable, Logger } from '@nestjs/common';

interface TerraWebhookPayload {
  user: {
    user_id: string;
    provider: string;
    reference_id: string; // Your user ID
  };
  type: string;
  data: TerraHealthData[];
}

interface TerraHealthData {
  metadata?: {
    start_time: string;
    end_time: string;
  };
  daily?: {
    steps?: number;
    calories_active?: number;
    distance_meters?: number;
    floors_climbed?: number;
  };
  activity?: {
    name?: string;
    duration_seconds?: number;
    calories?: number;
    distance_meters?: number;
    heart_rate_avg?: number;
  };
  sleep?: {
    duration_seconds?: number;
    sleep_score?: number;
    deep_sleep_seconds?: number;
    rem_sleep_seconds?: number;
  };
}

interface ProcessedHealthData {
  userId: string;
  date: string;
  steps: number;
  activeCalories: number;
  distanceMeters: number;
  floorsClimbed: number;
  sleepMinutes: number;
  sleepScore: number;
  workouts: {
    name: string;
    durationMinutes: number;
    calories: number;
  }[];
}

@Injectable()
export class HealthIntegrationService {
  private readonly logger = new Logger(HealthIntegrationService.name);

  /**
   * Process incoming Terra webhook data
   */
  async processWebhook(payload: TerraWebhookPayload): Promise<ProcessedHealthData | null> {
    try {
      const userId = payload.user.reference_id;
      
      if (!userId) {
        this.logger.warn('No reference_id in Terra webhook');
        return null;
      }

      let processedData: ProcessedHealthData = {
        userId,
        date: new Date().toISOString().split('T')[0],
        steps: 0,
        activeCalories: 0,
        distanceMeters: 0,
        floorsClimbed: 0,
        sleepMinutes: 0,
        sleepScore: 0,
        workouts: [],
      };

      for (const data of payload.data) {
        // Process daily data
        if (data.daily) {
          processedData.steps += data.daily.steps || 0;
          processedData.activeCalories += data.daily.calories_active || 0;
          processedData.distanceMeters += data.daily.distance_meters || 0;
          processedData.floorsClimbed += data.daily.floors_climbed || 0;
        }

        // Process activity/workout data
        if (data.activity) {
          processedData.workouts.push({
            name: data.activity.name || 'Unknown Workout',
            durationMinutes: Math.round((data.activity.duration_seconds || 0) / 60),
            calories: data.activity.calories || 0,
          });
        }

        // Process sleep data
        if (data.sleep) {
          processedData.sleepMinutes = Math.round((data.sleep.duration_seconds || 0) / 60);
          processedData.sleepScore = data.sleep.sleep_score || 0;
        }
      }

      return processedData;
    } catch (error) {
      this.logger.error('Error processing Terra webhook:', error);
      return null;
    }
  }

  /**
   * Map health data to quest progress
   */
  mapToQuestProgress(healthData: ProcessedHealthData): Map<string, number> {
    const progress = new Map<string, number>();

    // Steps-based quests
    progress.set('steps', healthData.steps);
    progress.set('walking', healthData.steps);

    // Distance-based quests (convert to km)
    progress.set('distance_km', healthData.distanceMeters / 1000);
    progress.set('running', healthData.distanceMeters / 1000);

    // Calorie-based quests
    progress.set('calories', healthData.activeCalories);
    progress.set('burn_calories', healthData.activeCalories);

    // Floors/stairs
    progress.set('floors', healthData.floorsClimbed);
    progress.set('stairs', healthData.floorsClimbed);

    // Sleep-based quests (convert to hours)
    progress.set('sleep_hours', healthData.sleepMinutes / 60);
    progress.set('sleep', healthData.sleepMinutes / 60);

    // Workout-based quests
    const totalWorkoutMinutes = healthData.workouts.reduce(
      (sum, w) => sum + w.durationMinutes, 0
    );
    progress.set('workout_minutes', totalWorkoutMinutes);
    progress.set('exercise', totalWorkoutMinutes);
    progress.set('gym', healthData.workouts.length);

    return progress;
  }

  /**
   * Calculate XP bonus based on health metrics
   */
  calculateHealthXpBonus(healthData: ProcessedHealthData): number {
    let bonus = 0;

    // Steps bonus (1 XP per 1000 steps, max 10 XP)
    bonus += Math.min(10, Math.floor(healthData.steps / 1000));

    // Workout bonus (5 XP per workout, max 25 XP)
    bonus += Math.min(25, healthData.workouts.length * 5);

    // Sleep bonus (good sleep = 7-9 hours = 10 XP)
    const sleepHours = healthData.sleepMinutes / 60;
    if (sleepHours >= 7 && sleepHours <= 9) {
      bonus += 10;
    } else if (sleepHours >= 6) {
      bonus += 5;
    }

    // Active calories bonus (1 XP per 100 calories, max 10 XP)
    bonus += Math.min(10, Math.floor(healthData.activeCalories / 100));

    return bonus;
  }

  /**
   * Get Terra connection URL for a user
   */
  getConnectionUrl(userId: string, provider?: string): string {
    const terraApiKey = process.env.TERRA_API_KEY;
    const terraDevId = process.env.TERRA_DEV_ID;
    
    if (!terraApiKey || !terraDevId) {
      throw new Error('Terra API credentials not configured');
    }

    // In production, you would use Terra's widget or generate a connection URL
    // This is a simplified example
    const baseUrl = 'https://widget.tryterra.co';
    const params = new URLSearchParams({
      dev_id: terraDevId,
      reference_id: userId,
    });

    if (provider) {
      params.set('provider', provider);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Supported health data providers
   */
  getSupportedProviders(): { id: string; name: string; icon: string }[] {
    return [
      { id: 'APPLE', name: 'Apple Health', icon: '🍎' },
      { id: 'GOOGLE', name: 'Google Fit', icon: '🔵' },
      { id: 'FITBIT', name: 'Fitbit', icon: '💚' },
      { id: 'GARMIN', name: 'Garmin', icon: '🔴' },
      { id: 'OURA', name: 'Oura Ring', icon: '⭕' },
      { id: 'WHOOP', name: 'WHOOP', icon: '⚫' },
      { id: 'SAMSUNG', name: 'Samsung Health', icon: '🔷' },
      { id: 'WITHINGS', name: 'Withings', icon: '💙' },
    ];
  }
}
