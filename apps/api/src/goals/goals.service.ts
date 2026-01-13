import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Goal } from '@solo-leveling/shared';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalsService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  /**
   * Get all goals for the authenticated user
   * RLS ensures only user's own goals are returned
   */
  async findAll(userId: string): Promise<Goal[]> {
    const { data, error } = await this.supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch goals: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single goal by ID
   * RLS ensures user can only access their own goal
   */
  async findOne(userId: string, goalId: string): Promise<Goal> {
    const { data, error } = await this.supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Goal with ID ${goalId} not found`);
    }

    return data;
  }

  /**
   * Create a new goal for the authenticated user
   * Server explicitly sets user_id from auth token
   * RLS validates the user_id matches auth.uid()
   */
  async create(userId: string, createGoalDto: CreateGoalDto): Promise<Goal> {
    const { data, error } = await this.supabase
      .from('goals')
      .insert({
        user_id: userId, // Server sets this - client cannot override
        title: createGoalDto.title,
        description: createGoalDto.description,
        difficulty: createGoalDto.difficulty,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create goal: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a goal
   * RLS ensures user can only delete their own goals
   */
  async remove(userId: string, goalId: string): Promise<void> {
    const { error } = await this.supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete goal: ${error.message}`);
    }
  }
}
