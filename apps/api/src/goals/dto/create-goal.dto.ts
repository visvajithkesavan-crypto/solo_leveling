import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { QuestDifficulty } from '@solo-leveling/shared';

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(QuestDifficulty)
  @IsOptional()
  difficulty?: QuestDifficulty;
}
