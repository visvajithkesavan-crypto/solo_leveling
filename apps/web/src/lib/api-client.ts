import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Goal, 
  CreateGoalDto, 
  ApiResponse,
  StatusWindow,
  EvaluationResponse,
} from '@solo-leveling/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * API client for Solo Leveling System
 * Automatically includes Supabase auth token in requests
 */
export class ApiClient {
  private supabase = createClientComponentClient();

  private async getAuthHeaders(): Promise<HeadersInit> {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  /**
   * Get all goals for the current user
   */
  async getGoals(): Promise<Goal[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/goals`, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch goals');
    }

    const result: ApiResponse<Goal[]> = await response.json();
    return result.data || [];
  }

  /**
   * Create a new goal
   */
  async createGoal(dto: CreateGoalDto): Promise<Goal> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/goals`, {
      method: 'POST',
      headers,
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error('Failed to create goal');
    }

    const result: ApiResponse<Goal> = await response.json();
    if (!result.data) {
      throw new Error('No data returned');
    }
    return result.data;
  }

  /**
   * Delete a goal
   */
  async deleteGoal(id: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/goals/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to delete goal');
    }
  }

  /**
   * Get status window data (level, XP, streaks)
   */
  async getStatusWindow(): Promise<StatusWindow> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/progress/status-window`, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch status window');
    }

    const result: ApiResponse<StatusWindow> = await response.json();
    if (!result.data) {
      throw new Error('No data returned');
    }
    return result.data;
  }

  /**
   * Evaluate all quests for a specific day
   */
  async evaluateDay(day?: string): Promise<EvaluationResponse> {
    const headers = await this.getAuthHeaders();
    const url = day 
      ? `${API_URL}/v1/engine/evaluate-day?day=${day}`
      : `${API_URL}/v1/engine/evaluate-day`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to evaluate day');
    }

    const result: ApiResponse<EvaluationResponse> = await response.json();
    if (!result.data) {
      throw new Error('No data returned');
    }
    return result.data;
  }

  /**
   * Log manual steps from web interface
   */
  async logManualSteps(steps: number, day?: string): Promise<{ success: boolean; message: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/ingest/health/manual-steps`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ steps, day }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to log steps');
    }

    const result: ApiResponse<{ success: boolean; message: string }> = await response.json();
    if (!result.data) {
      throw new Error('No data returned');
    }
    return result.data;
  }
}

export const apiClient = new ApiClient();
