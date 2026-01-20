import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiQuestService } from './ai-quest.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AiController],
  providers: [AiQuestService],
  exports: [AiQuestService],
})
export class AiModule {}
