/**
 * Solo Leveling System - AI Coach Module
 * 
 * Registers all AI coaching services and controllers.
 */

import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';

// Services
import { OpenAIService } from './openai.service';
import { GoalAnalyzerService } from './goal-analyzer.service';
import { QuestGeneratorService } from './quest-generator.service';
import { PerformanceAnalyzerService } from './performance-analyzer.service';
import { MilestoneTrackerService } from './milestone-tracker.service';
import { QuestSchedulerService } from './quest-scheduler.service';
import { HonestRankingService } from './honest-ranking.service';
import { AssessmentService } from './assessment.service';

// Controller
import { AICoachController } from './ai-coach.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [AICoachController],
  providers: [
    OpenAIService,
    GoalAnalyzerService,
    QuestGeneratorService,
    PerformanceAnalyzerService,
    MilestoneTrackerService,
    QuestSchedulerService,
    HonestRankingService,
    AssessmentService,
  ],
  exports: [
    OpenAIService,
    GoalAnalyzerService,
    QuestGeneratorService,
    PerformanceAnalyzerService,
    MilestoneTrackerService,
    QuestSchedulerService,
    HonestRankingService,
    AssessmentService,
  ],
})
export class AICoachModule {}
