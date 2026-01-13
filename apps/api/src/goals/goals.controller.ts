import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { AuthGuard } from '../supabase/auth.guard';
import { ApiResponse, Goal } from '@solo-leveling/shared';

@Controller('v1/goals')
@UseGuards(AuthGuard) // All endpoints require authentication
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  /**
   * GET /api/v1/goals
   * Returns all goals for the authenticated user
   */
  @Get()
  async findAll(@Request() req): Promise<ApiResponse<Goal[]>> {
    const userId = req.user.id; // Extracted from validated JWT by AuthGuard
    const goals = await this.goalsService.findAll(userId);
    
    return {
      success: true,
      data: goals,
    };
  }

  /**
   * GET /api/v1/goals/:id
   * Returns a specific goal if it belongs to the authenticated user
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string): Promise<ApiResponse<Goal>> {
    const userId = req.user.id;
    const goal = await this.goalsService.findOne(userId, id);
    
    return {
      success: true,
      data: goal,
    };
  }

  /**
   * POST /api/v1/goals
   * Creates a new goal for the authenticated user
   * Server explicitly sets user_id from auth token
   */
  @Post()
  async create(@Request() req, @Body() createGoalDto: CreateGoalDto): Promise<ApiResponse<Goal>> {
    const userId = req.user.id;
    const goal = await this.goalsService.create(userId, createGoalDto);
    
    return {
      success: true,
      data: goal,
      message: 'Goal created successfully',
    };
  }

  /**
   * DELETE /api/v1/goals/:id
   * Deletes a goal if it belongs to the authenticated user
   */
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string): Promise<ApiResponse> {
    const userId = req.user.id;
    await this.goalsService.remove(userId, id);
    
    return {
      success: true,
      message: 'Goal deleted successfully',
    };
  }
}
