/**
 * Solo Leveling System - Honest Ranking Service
 * 
 * Provides brutally honest, reality-based rankings for users.
 * The goal is to show users exactly where they stand and what it takes
 * to reach the top 1% in their chosen domain.
 * 
 * Based on real-world data and percentiles:
 * - F-Rank: Bottom 20% (complete beginner, no experience)
 * - E-Rank: 20-50% (below average, just starting)
 * - D-Rank: 50-75% (average person)
 * - C-Rank: 75-90% (above average, consistent effort)
 * - B-Rank: 90-99% (dedicated, serious practitioner)
 * - A-Rank: 99-99.9% (elite amateur, top 1% - THE GOAL)
 * - S-Rank: Top 0.1% (professional/world-class level)
 */

import { Injectable, Logger } from '@nestjs/common';

export type HunterRank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface RankThreshold {
  rank: HunterRank;
  minPercentile: number;
  maxPercentile: number;
  label: string;
  color: string;
}

export const RANK_THRESHOLDS: RankThreshold[] = [
  { rank: 'F', minPercentile: 0, maxPercentile: 20, label: 'Beginner', color: '#6B7280' },
  { rank: 'E', minPercentile: 20, maxPercentile: 50, label: 'Below Average', color: '#92400E' },
  { rank: 'D', minPercentile: 50, maxPercentile: 75, label: 'Average', color: '#065F46' },
  { rank: 'C', minPercentile: 75, maxPercentile: 90, label: 'Above Average', color: '#1E40AF' },
  { rank: 'B', minPercentile: 90, maxPercentile: 99, label: 'Dedicated', color: '#7C3AED' },
  { rank: 'A', minPercentile: 99, maxPercentile: 99.9, label: 'Elite (Top 1%)', color: '#DC2626' },
  { rank: 'S', minPercentile: 99.9, maxPercentile: 100, label: 'World Class', color: '#F59E0B' },
];

export interface GoalCategory {
  id: string;
  name: string;
  description: string;
  metrics: MetricDefinition[];
  benchmarks: RankBenchmark[];
}

export interface MetricDefinition {
  id: string;
  name: string;
  unit: string;
  question: string;
  importance: 'critical' | 'important' | 'supporting';
  higherIsBetter: boolean;
}

export interface RankBenchmark {
  rank: HunterRank;
  description: string;
  metrics: Record<string, { min: number; max: number }>;
}

export interface HonestAssessment {
  goalCategory: string;
  currentRank: HunterRank;
  percentile: number;
  honestTruth: string;
  topOnePercentLooksLike: string;
  gapToTopOnePercent: string[];
  estimatedYearsToTop: number;
  immediateActions: string[];
  growthMindsetMessage: string;
  metrics: AssessedMetric[];
}

export interface AssessedMetric {
  name: string;
  currentValue: number | string;
  unit: string;
  percentile: number;
  topOnePercentValue: string;
}

// ============================================================================
// REAL-WORLD GOAL CATEGORIES WITH HONEST BENCHMARKS
// ============================================================================

export const GOAL_CATEGORIES: GoalCategory[] = [
  // RUNNING - MARATHON
  {
    id: 'running_marathon',
    name: 'Marathon Running',
    description: 'Complete a marathon (42.195 km / 26.2 miles)',
    metrics: [
      { id: 'marathon_time', name: 'Marathon Time', unit: 'minutes', question: 'What is your current or estimated marathon time?', importance: 'critical', higherIsBetter: false },
      { id: 'weekly_mileage', name: 'Weekly Running Distance', unit: 'km', question: 'How many kilometers do you run per week?', importance: 'critical', higherIsBetter: true },
      { id: 'longest_run', name: 'Longest Run', unit: 'km', question: 'What is the longest distance you have ever run?', importance: 'important', higherIsBetter: true },
      { id: 'years_running', name: 'Years Running', unit: 'years', question: 'How many years have you been running consistently?', importance: 'supporting', higherIsBetter: true },
    ],
    benchmarks: [
      { rank: 'F', description: 'Cannot run more than 2-3 km without stopping', metrics: { marathon_time: { min: 999, max: 999 }, weekly_mileage: { min: 0, max: 5 }, longest_run: { min: 0, max: 5 } } },
      { rank: 'E', description: 'Can run 5-10 km, never completed a marathon', metrics: { marathon_time: { min: 360, max: 999 }, weekly_mileage: { min: 5, max: 20 }, longest_run: { min: 5, max: 15 } } },
      { rank: 'D', description: 'Finished a marathon in 5-6 hours', metrics: { marathon_time: { min: 300, max: 360 }, weekly_mileage: { min: 20, max: 40 }, longest_run: { min: 15, max: 30 } } },
      { rank: 'C', description: 'Marathon in 4-5 hours, consistent training', metrics: { marathon_time: { min: 240, max: 300 }, weekly_mileage: { min: 40, max: 60 }, longest_run: { min: 25, max: 35 } } },
      { rank: 'B', description: 'Marathon in 3:30-4:00, dedicated runner', metrics: { marathon_time: { min: 210, max: 240 }, weekly_mileage: { min: 60, max: 90 }, longest_run: { min: 30, max: 42 } } },
      { rank: 'A', description: 'Marathon sub-3:00, Boston Qualifier level', metrics: { marathon_time: { min: 165, max: 210 }, weekly_mileage: { min: 80, max: 130 }, longest_run: { min: 35, max: 50 } } },
      { rank: 'S', description: 'Sub-2:30 marathon, elite/professional', metrics: { marathon_time: { min: 0, max: 165 }, weekly_mileage: { min: 130, max: 250 }, longest_run: { min: 40, max: 60 } } },
    ],
  },
  
  // RUNNING - 5K
  {
    id: 'running_5k',
    name: '5K Running',
    description: 'Run 5 kilometers as fast as possible',
    metrics: [
      { id: 'time_5k', name: '5K Time', unit: 'minutes', question: 'What is your current 5K time (or best estimate)?', importance: 'critical', higherIsBetter: false },
      { id: 'weekly_runs', name: 'Runs Per Week', unit: 'times', question: 'How many times per week do you run?', importance: 'important', higherIsBetter: true },
      { id: 'can_run_5k', name: 'Can Complete 5K', unit: 'boolean', question: 'Can you currently run 5K without stopping?', importance: 'critical', higherIsBetter: true },
    ],
    benchmarks: [
      { rank: 'F', description: 'Cannot run 5K without stopping', metrics: { time_5k: { min: 45, max: 999 }, weekly_runs: { min: 0, max: 1 } } },
      { rank: 'E', description: '35-45 min 5K with walking intervals', metrics: { time_5k: { min: 35, max: 45 }, weekly_runs: { min: 1, max: 2 } } },
      { rank: 'D', description: '28-35 min 5K, slow steady jog', metrics: { time_5k: { min: 28, max: 35 }, weekly_runs: { min: 2, max: 3 } } },
      { rank: 'C', description: '23-28 min 5K, consistent runner', metrics: { time_5k: { min: 23, max: 28 }, weekly_runs: { min: 3, max: 4 } } },
      { rank: 'B', description: '18-23 min 5K, dedicated runner', metrics: { time_5k: { min: 18, max: 23 }, weekly_runs: { min: 4, max: 6 } } },
      { rank: 'A', description: '16-18 min 5K, competitive amateur', metrics: { time_5k: { min: 16, max: 18 }, weekly_runs: { min: 5, max: 7 } } },
      { rank: 'S', description: 'Sub-16 min 5K, elite/professional', metrics: { time_5k: { min: 0, max: 16 }, weekly_runs: { min: 6, max: 14 } } },
    ],
  },

  // STRENGTH - POWERLIFTING
  {
    id: 'strength_powerlifting',
    name: 'Powerlifting / Strength',
    description: 'Build maximal strength in squat, bench, deadlift',
    metrics: [
      { id: 'squat_ratio', name: 'Squat (x Bodyweight)', unit: 'ratio', question: 'What is your squat max as a multiple of bodyweight? (e.g., 1.5 means you squat 1.5x your weight)', importance: 'critical', higherIsBetter: true },
      { id: 'bench_ratio', name: 'Bench Press (x Bodyweight)', unit: 'ratio', question: 'What is your bench press max as a multiple of bodyweight?', importance: 'critical', higherIsBetter: true },
      { id: 'deadlift_ratio', name: 'Deadlift (x Bodyweight)', unit: 'ratio', question: 'What is your deadlift max as a multiple of bodyweight?', importance: 'critical', higherIsBetter: true },
      { id: 'years_lifting', name: 'Years Lifting', unit: 'years', question: 'How many years have you been strength training consistently?', importance: 'supporting', higherIsBetter: true },
    ],
    benchmarks: [
      { rank: 'F', description: 'Never lifted weights or just started', metrics: { squat_ratio: { min: 0, max: 0.5 }, bench_ratio: { min: 0, max: 0.3 }, deadlift_ratio: { min: 0, max: 0.5 } } },
      { rank: 'E', description: 'Basic lifts with light weight', metrics: { squat_ratio: { min: 0.5, max: 0.75 }, bench_ratio: { min: 0.3, max: 0.5 }, deadlift_ratio: { min: 0.5, max: 1.0 } } },
      { rank: 'D', description: 'Squat BW, Bench 0.75x, Deadlift 1.25x', metrics: { squat_ratio: { min: 0.75, max: 1.25 }, bench_ratio: { min: 0.5, max: 0.75 }, deadlift_ratio: { min: 1.0, max: 1.5 } } },
      { rank: 'C', description: 'Squat 1.5x, Bench 1x, Deadlift 2x', metrics: { squat_ratio: { min: 1.25, max: 1.75 }, bench_ratio: { min: 0.75, max: 1.25 }, deadlift_ratio: { min: 1.5, max: 2.0 } } },
      { rank: 'B', description: 'Squat 2x, Bench 1.5x, Deadlift 2.5x', metrics: { squat_ratio: { min: 1.75, max: 2.25 }, bench_ratio: { min: 1.25, max: 1.5 }, deadlift_ratio: { min: 2.0, max: 2.75 } } },
      { rank: 'A', description: 'Competitive powerlifter numbers', metrics: { squat_ratio: { min: 2.25, max: 2.75 }, bench_ratio: { min: 1.5, max: 2.0 }, deadlift_ratio: { min: 2.75, max: 3.25 } } },
      { rank: 'S', description: 'Elite powerlifter / record holder', metrics: { squat_ratio: { min: 2.75, max: 5 }, bench_ratio: { min: 2.0, max: 4 }, deadlift_ratio: { min: 3.25, max: 5 } } },
    ],
  },

  // WEIGHT LOSS / BODY COMPOSITION
  {
    id: 'weight_loss',
    name: 'Weight Loss / Body Composition',
    description: 'Lose body fat and achieve a lean physique',
    metrics: [
      { id: 'body_fat', name: 'Body Fat Percentage', unit: '%', question: 'What is your current body fat percentage (estimate if unknown)?', importance: 'critical', higherIsBetter: false },
      { id: 'bmi', name: 'BMI', unit: 'kg/m²', question: 'What is your BMI? (weight in kg / height in meters squared)', importance: 'important', higherIsBetter: false },
      { id: 'weekly_workouts', name: 'Workouts Per Week', unit: 'times', question: 'How many times per week do you exercise?', importance: 'important', higherIsBetter: true },
      { id: 'tracks_nutrition', name: 'Track Nutrition', unit: 'boolean', question: 'Do you currently track your calories/macros?', importance: 'supporting', higherIsBetter: true },
    ],
    benchmarks: [
      { rank: 'F', description: 'Obese (BMI 30+), sedentary, no diet control', metrics: { body_fat: { min: 35, max: 100 }, bmi: { min: 30, max: 50 } } },
      { rank: 'E', description: 'Overweight (BMI 25-30), sporadic exercise', metrics: { body_fat: { min: 28, max: 35 }, bmi: { min: 25, max: 30 } } },
      { rank: 'D', description: 'Normal BMI, 20-28% body fat', metrics: { body_fat: { min: 20, max: 28 }, bmi: { min: 20, max: 25 } } },
      { rank: 'C', description: 'Fit appearance, 15-20% body fat (men) / 22-27% (women)', metrics: { body_fat: { min: 15, max: 20 }, bmi: { min: 20, max: 25 } } },
      { rank: 'B', description: 'Athletic build, 12-15% BF (men) / 18-22% (women)', metrics: { body_fat: { min: 12, max: 15 }, bmi: { min: 20, max: 24 } } },
      { rank: 'A', description: 'Visible abs, 8-12% BF (men) / 15-18% (women)', metrics: { body_fat: { min: 8, max: 12 }, bmi: { min: 20, max: 24 } } },
      { rank: 'S', description: 'Competition-ready, sub-8% BF (men) / sub-15% (women)', metrics: { body_fat: { min: 3, max: 8 }, bmi: { min: 20, max: 24 } } },
    ],
  },

  // YOGA / FLEXIBILITY
  {
    id: 'yoga_flexibility',
    name: 'Yoga / Flexibility',
    description: 'Master yoga and achieve exceptional flexibility',
    metrics: [
      { id: 'touch_toes', name: 'Touch Toes', unit: 'boolean', question: 'Can you touch your toes with straight legs?', importance: 'supporting', higherIsBetter: true },
      { id: 'practice_years', name: 'Years Practicing', unit: 'years', question: 'How many years have you practiced yoga?', importance: 'important', higherIsBetter: true },
      { id: 'weekly_practice', name: 'Weekly Practice', unit: 'hours', question: 'How many hours per week do you practice yoga?', importance: 'critical', higherIsBetter: true },
      { id: 'advanced_poses', name: 'Advanced Poses', unit: 'count', question: 'How many of these can you do: headstand, handstand, wheel, crow, splits?', importance: 'critical', higherIsBetter: true },
    ],
    benchmarks: [
      { rank: 'F', description: 'Very stiff, cannot touch toes, never practiced', metrics: { practice_years: { min: 0, max: 0 }, weekly_practice: { min: 0, max: 0 }, advanced_poses: { min: 0, max: 0 } } },
      { rank: 'E', description: 'Beginner, can do basic stretches', metrics: { practice_years: { min: 0, max: 0.5 }, weekly_practice: { min: 0.5, max: 2 }, advanced_poses: { min: 0, max: 0 } } },
      { rank: 'D', description: '30-min sessions, basic poses with effort', metrics: { practice_years: { min: 0.5, max: 1 }, weekly_practice: { min: 1, max: 3 }, advanced_poses: { min: 0, max: 1 } } },
      { rank: 'C', description: '60-min sessions, intermediate poses, good form', metrics: { practice_years: { min: 1, max: 3 }, weekly_practice: { min: 3, max: 5 }, advanced_poses: { min: 1, max: 2 } } },
      { rank: 'B', description: 'Advanced poses (headstand, wheel), 90+ min sessions', metrics: { practice_years: { min: 3, max: 7 }, weekly_practice: { min: 5, max: 10 }, advanced_poses: { min: 2, max: 4 } } },
      { rank: 'A', description: 'Instructor level, complex sequences, all arm balances', metrics: { practice_years: { min: 7, max: 15 }, weekly_practice: { min: 7, max: 15 }, advanced_poses: { min: 4, max: 5 } } },
      { rank: 'S', description: 'Master practitioner, teaching teachers', metrics: { practice_years: { min: 15, max: 50 }, weekly_practice: { min: 10, max: 30 }, advanced_poses: { min: 5, max: 5 } } },
    ],
  },

  // DAILY STEPS / GENERAL ACTIVITY
  {
    id: 'daily_activity',
    name: 'Daily Activity / Steps',
    description: 'Maintain high daily activity and step count',
    metrics: [
      { id: 'daily_steps', name: 'Daily Steps', unit: 'steps', question: 'How many steps do you average per day?', importance: 'critical', higherIsBetter: true },
      { id: 'active_minutes', name: 'Active Minutes', unit: 'minutes', question: 'How many active minutes per day (walking, exercise)?', importance: 'important', higherIsBetter: true },
      { id: 'sedentary_hours', name: 'Sedentary Hours', unit: 'hours', question: 'How many hours per day are you sitting/sedentary?', importance: 'important', higherIsBetter: false },
    ],
    benchmarks: [
      { rank: 'F', description: 'Under 2,000 steps/day, very sedentary', metrics: { daily_steps: { min: 0, max: 2000 }, active_minutes: { min: 0, max: 15 } } },
      { rank: 'E', description: '2,000-5,000 steps/day', metrics: { daily_steps: { min: 2000, max: 5000 }, active_minutes: { min: 15, max: 30 } } },
      { rank: 'D', description: '5,000-7,500 steps/day (average)', metrics: { daily_steps: { min: 5000, max: 7500 }, active_minutes: { min: 30, max: 45 } } },
      { rank: 'C', description: '7,500-10,000 steps/day', metrics: { daily_steps: { min: 7500, max: 10000 }, active_minutes: { min: 45, max: 60 } } },
      { rank: 'B', description: '10,000-15,000 steps/day', metrics: { daily_steps: { min: 10000, max: 15000 }, active_minutes: { min: 60, max: 90 } } },
      { rank: 'A', description: '15,000-20,000 steps/day', metrics: { daily_steps: { min: 15000, max: 20000 }, active_minutes: { min: 90, max: 120 } } },
      { rank: 'S', description: '20,000+ steps/day consistently', metrics: { daily_steps: { min: 20000, max: 100000 }, active_minutes: { min: 120, max: 300 } } },
    ],
  },

  // GENERAL FITNESS
  {
    id: 'general_fitness',
    name: 'General Fitness',
    description: 'Overall fitness and conditioning',
    metrics: [
      { id: 'weekly_workouts', name: 'Workouts Per Week', unit: 'times', question: 'How many times per week do you exercise?', importance: 'critical', higherIsBetter: true },
      { id: 'workout_duration', name: 'Average Workout Duration', unit: 'minutes', question: 'How long is your average workout session?', importance: 'important', higherIsBetter: true },
      { id: 'years_training', name: 'Years Training', unit: 'years', question: 'How many years have you been exercising consistently?', importance: 'supporting', higherIsBetter: true },
      { id: 'resting_hr', name: 'Resting Heart Rate', unit: 'bpm', question: 'What is your resting heart rate?', importance: 'important', higherIsBetter: false },
    ],
    benchmarks: [
      { rank: 'F', description: 'No exercise habit, gets winded climbing stairs', metrics: { weekly_workouts: { min: 0, max: 0 }, workout_duration: { min: 0, max: 0 }, resting_hr: { min: 80, max: 120 } } },
      { rank: 'E', description: '1-2 workouts/week, light activity', metrics: { weekly_workouts: { min: 1, max: 2 }, workout_duration: { min: 15, max: 30 }, resting_hr: { min: 70, max: 85 } } },
      { rank: 'D', description: '2-3 workouts/week, 30-45 min sessions', metrics: { weekly_workouts: { min: 2, max: 3 }, workout_duration: { min: 30, max: 45 }, resting_hr: { min: 65, max: 75 } } },
      { rank: 'C', description: '3-4 workouts/week, 45-60 min sessions', metrics: { weekly_workouts: { min: 3, max: 4 }, workout_duration: { min: 45, max: 60 }, resting_hr: { min: 58, max: 68 } } },
      { rank: 'B', description: '5-6 workouts/week, 60+ min sessions', metrics: { weekly_workouts: { min: 5, max: 6 }, workout_duration: { min: 60, max: 90 }, resting_hr: { min: 50, max: 60 } } },
      { rank: 'A', description: 'Daily training, high performance metrics', metrics: { weekly_workouts: { min: 6, max: 7 }, workout_duration: { min: 75, max: 120 }, resting_hr: { min: 45, max: 55 } } },
      { rank: 'S', description: 'Elite conditioning, multiple sessions/day', metrics: { weekly_workouts: { min: 7, max: 14 }, workout_duration: { min: 90, max: 240 }, resting_hr: { min: 35, max: 50 } } },
    ],
  },

  // PRODUCTIVITY / DEEP WORK
  {
    id: 'productivity',
    name: 'Productivity / Deep Work',
    description: 'Master focus and high-output work',
    metrics: [
      { id: 'deep_work_hours', name: 'Deep Work Hours/Day', unit: 'hours', question: 'How many hours of uninterrupted, focused work can you do per day?', importance: 'critical', higherIsBetter: true },
      { id: 'focus_duration', name: 'Single Focus Duration', unit: 'minutes', question: 'How long can you focus on one task without distraction?', importance: 'important', higherIsBetter: true },
      { id: 'days_productive', name: 'Productive Days/Week', unit: 'days', question: 'How many days per week are you highly productive?', importance: 'important', higherIsBetter: true },
    ],
    benchmarks: [
      { rank: 'F', description: 'Cannot focus, constant distraction', metrics: { deep_work_hours: { min: 0, max: 0.5 }, focus_duration: { min: 0, max: 10 } } },
      { rank: 'E', description: '15-30 min focus sessions possible', metrics: { deep_work_hours: { min: 0.5, max: 1 }, focus_duration: { min: 10, max: 30 } } },
      { rank: 'D', description: '1-2 hours deep work, frequent breaks needed', metrics: { deep_work_hours: { min: 1, max: 2 }, focus_duration: { min: 30, max: 45 } } },
      { rank: 'C', description: '3-4 hours deep work daily', metrics: { deep_work_hours: { min: 2, max: 4 }, focus_duration: { min: 45, max: 60 } } },
      { rank: 'B', description: '4-5 hours deep work daily, consistent', metrics: { deep_work_hours: { min: 4, max: 5 }, focus_duration: { min: 60, max: 90 } } },
      { rank: 'A', description: '5-6 hours deep work, high output', metrics: { deep_work_hours: { min: 5, max: 6 }, focus_duration: { min: 90, max: 120 } } },
      { rank: 'S', description: 'Elite productivity, shipped major work', metrics: { deep_work_hours: { min: 6, max: 10 }, focus_duration: { min: 120, max: 240 } } },
    ],
  },
];

@Injectable()
export class HonestRankingService {
  private readonly logger = new Logger(HonestRankingService.name);

  /**
   * Get all available goal categories
   */
  getAllCategories(): GoalCategory[] {
    return GOAL_CATEGORIES;
  }

  /**
   * Get a specific category by ID
   */
  getCategory(categoryId: string): GoalCategory | undefined {
    return GOAL_CATEGORIES.find(c => c.id === categoryId);
  }

  /**
   * Detect goal category from goal text using keywords
   */
  detectCategoryFromGoal(goalText: string): GoalCategory {
    const text = goalText.toLowerCase();
    
    // Marathon / long distance running
    if (text.includes('marathon') || text.includes('26.2') || text.includes('42k')) {
      return this.getCategory('running_marathon')!;
    }
    
    // 5K running
    if (text.includes('5k') || text.includes('5 k') || (text.includes('run') && text.includes('fast'))) {
      return this.getCategory('running_5k')!;
    }
    
    // General running
    if (text.includes('run') || text.includes('jogging') || text.includes('cardio')) {
      return this.getCategory('running_5k')!;
    }
    
    // Strength / lifting
    if (text.includes('strength') || text.includes('lift') || text.includes('squat') || 
        text.includes('bench') || text.includes('deadlift') || text.includes('muscle') ||
        text.includes('powerlifting') || text.includes('gym')) {
      return this.getCategory('strength_powerlifting')!;
    }
    
    // Weight loss
    if (text.includes('weight') || text.includes('lose') || text.includes('fat') || 
        text.includes('lean') || text.includes('slim') || text.includes('diet') ||
        text.includes('pounds') || text.includes('kg') || text.includes('body')) {
      return this.getCategory('weight_loss')!;
    }
    
    // Yoga / flexibility
    if (text.includes('yoga') || text.includes('flexibility') || text.includes('stretch') ||
        text.includes('meditation') || text.includes('mindfulness')) {
      return this.getCategory('yoga_flexibility')!;
    }
    
    // Productivity
    if (text.includes('productive') || text.includes('focus') || text.includes('work') ||
        text.includes('study') || text.includes('concentration') || text.includes('deep work')) {
      return this.getCategory('productivity')!;
    }
    
    // Steps / activity
    if (text.includes('step') || text.includes('walk') || text.includes('active')) {
      return this.getCategory('daily_activity')!;
    }
    
    // Default to general fitness
    return this.getCategory('general_fitness')!;
  }

  /**
   * Calculate honest rank from user-provided metrics
   */
  calculateRank(
    categoryId: string,
    metrics: Record<string, number>,
  ): { rank: HunterRank; percentile: number; breakdown: AssessedMetric[] } {
    const category = this.getCategory(categoryId);
    if (!category) {
      throw new Error(`Unknown category: ${categoryId}`);
    }

    const breakdown: AssessedMetric[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    for (const metricDef of category.metrics) {
      const value = metrics[metricDef.id];
      if (value === undefined) continue;

      const weight = metricDef.importance === 'critical' ? 3 : 
                     metricDef.importance === 'important' ? 2 : 1;
      
      const percentile = this.calculateMetricPercentile(
        category,
        metricDef.id,
        value,
        metricDef.higherIsBetter,
      );

      totalScore += percentile * weight;
      totalWeight += weight;

      // Find top 1% value for this metric
      const aRankBenchmark = category.benchmarks.find(b => b.rank === 'A');
      const topValue = aRankBenchmark?.metrics[metricDef.id];
      
      breakdown.push({
        name: metricDef.name,
        currentValue: value,
        unit: metricDef.unit,
        percentile,
        topOnePercentValue: topValue 
          ? `${topValue.min}-${topValue.max} ${metricDef.unit}`
          : 'N/A',
      });
    }

    const overallPercentile = totalWeight > 0 ? totalScore / totalWeight : 0;
    const rank = this.percentileToRank(overallPercentile);

    return { rank, percentile: Math.round(overallPercentile), breakdown };
  }

  /**
   * Calculate percentile for a single metric
   */
  private calculateMetricPercentile(
    category: GoalCategory,
    metricId: string,
    value: number,
    higherIsBetter: boolean,
  ): number {
    // Find which rank range this value falls into
    for (const benchmark of category.benchmarks) {
      const range = benchmark.metrics[metricId];
      if (!range) continue;

      if (higherIsBetter) {
        if (value >= range.min && value <= range.max) {
          // Interpolate within the range
          const threshold = RANK_THRESHOLDS.find(t => t.rank === benchmark.rank)!;
          const rangeProgress = (value - range.min) / (range.max - range.min || 1);
          return threshold.minPercentile + rangeProgress * (threshold.maxPercentile - threshold.minPercentile);
        }
      } else {
        // For metrics where lower is better (like time)
        if (value >= range.min && value <= range.max) {
          const threshold = RANK_THRESHOLDS.find(t => t.rank === benchmark.rank)!;
          const rangeProgress = (range.max - value) / (range.max - range.min || 1);
          return threshold.minPercentile + rangeProgress * (threshold.maxPercentile - threshold.minPercentile);
        }
      }
    }

    // If value is below all ranges, it's F-rank
    return 5;
  }

  /**
   * Convert percentile to rank
   */
  percentileToRank(percentile: number): HunterRank {
    if (percentile >= 99.9) return 'S';
    if (percentile >= 99) return 'A';
    if (percentile >= 90) return 'B';
    if (percentile >= 75) return 'C';
    if (percentile >= 50) return 'D';
    if (percentile >= 20) return 'E';
    return 'F';
  }

  /**
   * Get rank info (color, label, etc.)
   */
  getRankInfo(rank: HunterRank): RankThreshold {
    return RANK_THRESHOLDS.find(t => t.rank === rank)!;
  }

  /**
   * Generate the complete honest assessment
   */
  generateHonestAssessment(
    goalText: string,
    categoryId: string,
    metrics: Record<string, number>,
    healthData?: Record<string, any>,
  ): HonestAssessment {
    const category = this.getCategory(categoryId);
    if (!category) {
      throw new Error(`Unknown category: ${categoryId}`);
    }

    const { rank, percentile, breakdown } = this.calculateRank(categoryId, metrics);
    const aRankBenchmark = category.benchmarks.find(b => b.rank === 'A')!;
    const currentBenchmark = category.benchmarks.find(b => b.rank === rank)!;

    // Calculate years to top 1%
    const yearsToTop = this.estimateYearsToTop(rank);

    return {
      goalCategory: category.name,
      currentRank: rank,
      percentile,
      honestTruth: this.generateHonestTruth(rank, currentBenchmark, percentile),
      topOnePercentLooksLike: aRankBenchmark.description,
      gapToTopOnePercent: this.generateGapAnalysis(rank, category),
      estimatedYearsToTop: yearsToTop,
      immediateActions: this.generateImmediateActions(rank, category),
      growthMindsetMessage: this.generateGrowthMessage(rank),
      metrics: breakdown,
    };
  }

  /**
   * Generate brutally honest truth about current level
   */
  private generateHonestTruth(
    rank: HunterRank,
    benchmark: RankBenchmark,
    percentile: number,
  ): string {
    const truths: Record<HunterRank, string> = {
      'F': `You're starting from the bottom. ${benchmark.description}. This is where MOST people are - and most people never leave. The question is whether you'll be different.`,
      'E': `You're below average. ${benchmark.description}. You've taken some steps, but you're behind most people who are actually trying. The real work hasn't started yet.`,
      'D': `You're average. ${benchmark.description}. Congratulations, you're like most people. Being average means you'll get average results. Is that enough for you?`,
      'C': `You're above average. ${benchmark.description}. You've put in real work, but "above average" is not exceptional. You're in the top 25%, but the top 1% is still far ahead.`,
      'B': `You're in the top 10%. ${benchmark.description}. This is impressive to most people - but you know you're not elite yet. The gap between here and A-rank is brutal.`,
      'A': `You're in the top 1%. ${benchmark.description}. You've achieved what most people only dream about. But S-rank is a different universe entirely.`,
      'S': `You're world-class. ${benchmark.description}. Maintaining this level requires constant vigilance. One slip and you fall back to the masses.`,
    };

    return `${truths[rank]} You're currently at the ${percentile}th percentile.`;
  }

  /**
   * Generate specific gaps to close
   */
  private generateGapAnalysis(rank: HunterRank, category: GoalCategory): string[] {
    const rankOrder: HunterRank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
    const currentIndex = rankOrder.indexOf(rank);
    const gaps: string[] = [];

    // Show what each rank above looks like
    for (let i = currentIndex + 1; i <= Math.min(currentIndex + 3, 5); i++) {
      const targetRank = rankOrder[i];
      const targetBenchmark = category.benchmarks.find(b => b.rank === targetRank);
      if (targetBenchmark) {
        gaps.push(`${targetRank}-Rank: ${targetBenchmark.description}`);
      }
    }

    // Always show A-rank if not already shown
    if (rank !== 'A' && rank !== 'S' && !gaps.some(g => g.startsWith('A-Rank'))) {
      const aRankBenchmark = category.benchmarks.find(b => b.rank === 'A');
      if (aRankBenchmark) {
        gaps.push(`A-Rank (TOP 1% - YOUR GOAL): ${aRankBenchmark.description}`);
      }
    }

    return gaps;
  }

  /**
   * Estimate years to reach top 1%
   */
  private estimateYearsToTop(currentRank: HunterRank): number {
    const estimates: Record<HunterRank, number> = {
      'F': 5,  // 5+ years from complete beginner
      'E': 4,  // 4 years from below average
      'D': 3,  // 3 years from average
      'C': 2,  // 2 years from above average
      'B': 1,  // 1 year from dedicated
      'A': 0.5, // 6 months to maintain/improve
      'S': 0,  // Already there
    };
    return estimates[currentRank];
  }

  /**
   * Generate immediate actions based on rank
   */
  private generateImmediateActions(rank: HunterRank, category: GoalCategory): string[] {
    const actions: Record<HunterRank, string[]> = {
      'F': [
        'Start TODAY - not tomorrow, not Monday, NOW',
        'Commit to showing up every single day for 30 days',
        'Track everything - what gets measured gets managed',
        'Find one person who has achieved your goal and study them',
        'Accept that you are a beginner and embrace the learning process',
      ],
      'E': [
        'Increase your frequency - you need more volume',
        'Get a structured program or coach',
        'Remove all excuses from your environment',
        'Set a specific milestone for 90 days from now',
        'Join a community of people at or above your level',
      ],
      'D': [
        'Average effort = average results. Increase intensity.',
        'Study what separates B-rank from D-rank',
        'Find your weak points and attack them',
        'Make your training non-negotiable',
        'Stop comparing yourself to beginners',
      ],
      'C': [
        'You have a foundation - now specialize',
        'Seek out harder challenges that scare you',
        'Get feedback from someone at A/B rank',
        'Optimize your recovery and nutrition',
        'Enter a competition or set a public goal',
      ],
      'B': [
        'You need elite-level coaching now',
        'Every detail matters at this level',
        'Study the routines of A-rank athletes',
        'Your mental game is now as important as physical',
        'Prepare for the long plateau - this is where most quit',
      ],
      'A': [
        'Focus on the 1% improvements',
        'Mentor others to solidify your knowledge',
        'Study S-rank performers obsessively',
        'Protect your recovery like your life depends on it',
        'Consider if S-rank is truly your goal',
      ],
      'S': [
        'Maintain your edge with relentless consistency',
        'Give back to the community',
        'Set new challenges to stay motivated',
        'Document your journey for others',
        'Never become complacent',
      ],
    };

    return actions[rank];
  }

  /**
   * Generate Growth Mindset encouragement
   */
  private generateGrowthMessage(rank: HunterRank): string {
    const messages: Record<HunterRank, string> = {
      'F': "Your current rank does NOT define you. Every expert was once a beginner. The fact that you're here, seeking honest feedback, already separates you from the masses. F-rank is not your identity - it's your starting point. Embrace it. The journey of a thousand miles begins with a single step, and you just took it.",
      'E': "You've started. That puts you ahead of everyone still on the couch. The path from E to D is about consistency, not talent. Show up every day, especially when you don't feel like it. That's where character is built. Struggle is not a sign of failure - it's the feeling of getting stronger.",
      'D': "Being average is a choice. You now have the foundation to break through to the top quartile. The difference between D-rank and C-rank is not ability - it's commitment. Decide today that average is not acceptable. Your effort determines your ceiling, not your starting point.",
      'C': "You've proven you can commit. Now prove you can excel. C-rank is where most people get comfortable and stop. Don't be most people. The gap from here to B-rank requires you to love the process more than the outcome. Fall in love with the daily grind.",
      'B': "Welcome to the top 10%. Few make it here. Fewer still go further. From this point, talent matters less than ever - what matters is relentless consistency, smart training, and mental fortitude. You're not far from elite. Don't stop now.",
      'A': "You've achieved what most only dream of. But you know better than anyone - there's always another level. S-rank is the realm of the truly exceptional. The question is: do you want it badly enough? The gap is brutal, but you've already proven you can do hard things.",
      'S': "You stand among the best in the world. But remember: the moment you stop growing, you start declining. Stay hungry. Stay humble. Your greatest competition is the person you were yesterday. Keep pushing the boundaries of what's possible.",
    };

    return messages[rank];
  }

  /**
   * Get assessment questions for a category
   */
  getAssessmentQuestions(categoryId: string): { id: string; question: string; type: 'number' | 'boolean' | 'select'; options?: string[] }[] {
    const category = this.getCategory(categoryId);
    if (!category) return [];

    return category.metrics.map(m => ({
      id: m.id,
      question: m.question,
      type: m.unit === 'boolean' ? 'boolean' : 'number',
    }));
  }
}
