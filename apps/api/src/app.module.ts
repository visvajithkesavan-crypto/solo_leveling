import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { GoalsModule } from './goals/goals.module';
import { SupabaseModule } from './supabase/supabase.module';
import { EngineModule } from './engine/engine.module';
import { ProgressModule } from './progress/progress.module';
import { IngestModule } from './ingest/ingest.module';
import { AiModule } from './ai/ai.module';
import { AICoachModule } from './ai-coach/ai-coach.module';

@Module({
  imports: [
    SupabaseModule,
    HealthModule,
    GoalsModule,
    EngineModule,
    ProgressModule,
    IngestModule,
    AiModule,
    AICoachModule,
  ],
})
export class AppModule {}
