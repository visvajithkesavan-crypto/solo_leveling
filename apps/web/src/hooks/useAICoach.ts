/**
 * Solo Leveling System - useAICoach Hook
 * 
 * React hook for managing AI coaching state including
 * goal setting, daily quests, and performance tracking.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  aiCoachApi,
  AICoachStatus,
  MasterGoal,
  MasterPlan,
  AIDailyQuest,
  WeeklyReview,
  MilestoneRecord,
  GoalProgress,
  SetGoalResponse,
  CompleteQuestResponse,
} from '@/lib/api-ai-coach';

interface UseAICoachState {
  // Data
  status: AICoachStatus | null;
  goal: MasterGoal | null;
  masterPlan: MasterPlan | null;
  dailyQuests: AIDailyQuest[];
  weeklyReview: WeeklyReview | null;
  milestones: MilestoneRecord[];
  nextMilestone: MilestoneRecord | null;
  goalProgress: GoalProgress | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  settingGoal: boolean;
  regeneratingQuests: boolean;
  completingQuest: boolean;
  
  // Capabilities
  hasActiveGoal: boolean;
  canRegenerate: boolean;
  regenerationsRemaining: number;
  weeklyReviewDue: boolean;
}

interface UseAICoachActions {
  // Actions
  setGoal: (goalText: string, timelineDays?: number) => Promise<SetGoalResponse>;
  regenerateQuests: (reason?: string) => Promise<void>;
  completeQuest: (questId: string, actualValue?: number) => Promise<CompleteQuestResponse>;
  triggerWeeklyReview: () => Promise<WeeklyReview>;
  refreshStatus: () => Promise<void>;
  refreshQuests: () => Promise<void>;
  clearError: () => void;
}

type UseAICoachReturn = UseAICoachState & UseAICoachActions;

export function useAICoach(): UseAICoachReturn {
  // Core state
  const [status, setStatus] = useState<AICoachStatus | null>(null);
  const [dailyQuests, setDailyQuests] = useState<AIDailyQuest[]>([]);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);
  const [milestones, setMilestones] = useState<MilestoneRecord[]>([]);
  const [nextMilestone, setNextMilestone] = useState<MilestoneRecord | null>(null);
  
  // Quest regeneration state
  const [canRegenerate, setCanRegenerate] = useState(true);
  const [regenerationsRemaining, setRegenerationsRemaining] = useState(3);
  const [goalProgress, setGoalProgress] = useState<GoalProgress | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [settingGoal, setSettingGoal] = useState(false);
  const [regeneratingQuests, setRegeneratingQuests] = useState(false);
  const [completingQuest, setCompletingQuest] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Derived values
  const goal = status?.goal || null;
  const masterPlan = status?.masterPlan || null;
  const hasActiveGoal = status?.hasActiveGoal || false;
  const weeklyReviewDue = status?.weeklyReviewDue || false;

  /**
   * Fetch comprehensive AI coach status
   */
  const refreshStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statusData = await aiCoachApi.getStatus();
      setStatus(statusData);
      setDailyQuests(statusData.todaysQuests || []);
      setNextMilestone(statusData.nextMilestone || null);
      
      if (statusData.lastWeeklyReview) {
        setWeeklyReview(statusData.lastWeeklyReview);
      }
      
      if (statusData.overallProgress) {
        setGoalProgress({
          percentage: statusData.overallProgress.percentage,
          daysElapsed: statusData.overallProgress.daysElapsed,
          daysRemaining: statusData.overallProgress.daysRemaining,
          currentPhase: statusData.currentPhase?.name || 'Phase 1',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI coach status');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch daily quests
   */
  const refreshQuests = useCallback(async () => {
    try {
      const response = await aiCoachApi.getDailyQuests();
      setDailyQuests(response.quests);
      setCanRegenerate(response.canRegenerate);
      setRegenerationsRemaining(response.regenerationsRemaining);
      if (response.goalProgress) {
        setGoalProgress(response.goalProgress);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quests');
    }
  }, []);

  /**
   * Set a new goal
   */
  const setGoal = useCallback(async (
    goalText: string,
    timelineDays?: number,
  ): Promise<SetGoalResponse> => {
    setSettingGoal(true);
    setError(null);
    
    try {
      const response = await aiCoachApi.setGoal(goalText, timelineDays);
      
      // Refresh status to get updated state
      await refreshStatus();
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set goal';
      setError(message);
      throw err;
    } finally {
      setSettingGoal(false);
    }
  }, [refreshStatus]);

  /**
   * Regenerate daily quests
   */
  const regenerateQuests = useCallback(async (reason?: string) => {
    if (!canRegenerate) {
      setError('No regenerations remaining today');
      return;
    }
    
    setRegeneratingQuests(true);
    setError(null);
    
    try {
      const response = await aiCoachApi.regenerateQuests(reason);
      setDailyQuests(response.quests);
      setCanRegenerate(response.canRegenerate);
      setRegenerationsRemaining(response.regenerationsRemaining);
      if (response.goalProgress) {
        setGoalProgress(response.goalProgress);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate quests');
    } finally {
      setRegeneratingQuests(false);
    }
  }, [canRegenerate]);

  /**
   * Complete a quest
   */
  const completeQuest = useCallback(async (
    questId: string,
    actualValue?: number,
  ): Promise<CompleteQuestResponse> => {
    setCompletingQuest(true);
    setError(null);
    
    try {
      const response = await aiCoachApi.completeQuest(questId, actualValue);
      
      // Update quest in local state
      setDailyQuests((prev) =>
        prev.map((q) =>
          q.id === questId
            ? { ...q, status: 'completed', completedAt: new Date().toISOString() }
            : q
        )
      );
      
      // If milestones were reached, update state
      if (response.milestonesReached && response.milestonesReached.length > 0) {
        await refreshStatus();
      }
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete quest';
      setError(message);
      throw err;
    } finally {
      setCompletingQuest(false);
    }
  }, [refreshStatus]);

  /**
   * Trigger weekly review manually
   */
  const triggerWeeklyReview = useCallback(async (): Promise<WeeklyReview> => {
    setError(null);
    
    try {
      const review = await aiCoachApi.triggerWeeklyReview();
      setWeeklyReview(review);
      return review;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate review');
      throw err;
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Fetch milestones when we have a goal
  useEffect(() => {
    if (hasActiveGoal) {
      aiCoachApi.getMilestones().then((data) => {
        setMilestones(data.milestones);
        setNextMilestone(data.nextMilestone);
      }).catch(() => {
        // Non-critical, don't set error
      });
    }
  }, [hasActiveGoal]);

  return {
    // Data
    status,
    goal,
    masterPlan,
    dailyQuests,
    weeklyReview,
    milestones,
    nextMilestone,
    goalProgress,
    
    // UI State
    loading,
    error,
    settingGoal,
    regeneratingQuests,
    completingQuest,
    
    // Capabilities
    hasActiveGoal,
    canRegenerate,
    regenerationsRemaining,
    weeklyReviewDue,
    
    // Actions
    setGoal,
    regenerateQuests,
    completeQuest,
    triggerWeeklyReview,
    refreshStatus,
    refreshQuests,
    clearError,
  };
}
