-- Migration: Gamification System - Job Classes, Achievements, Shadow Army
-- Phase 3D: Advanced Gamification Features

-- ============================================================================
-- TABLE: user_stats
-- Extended user statistics including job class and detailed stats
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  job_class TEXT NOT NULL DEFAULT 'none',
  class_xp BIGINT NOT NULL DEFAULT 0,
  class_level INT NOT NULL DEFAULT 1,
  strength INT NOT NULL DEFAULT 10,
  agility INT NOT NULL DEFAULT 10,
  intelligence INT NOT NULL DEFAULT 10,
  vitality INT NOT NULL DEFAULT 10,
  sense INT NOT NULL DEFAULT 10,
  total_quests_completed INT NOT NULL DEFAULT 0,
  total_xp_earned BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- Trigger for updated_at
CREATE TRIGGER set_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own user_stats"
  ON public.user_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_stats"
  ON public.user_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_stats"
  ON public.user_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.user_stats TO authenticated;

-- ============================================================================
-- TABLE: user_achievements
-- Tracks which achievements users have unlocked
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress INT NOT NULL DEFAULT 0,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON public.user_achievements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.user_achievements TO authenticated;

-- ============================================================================
-- TABLE: user_shadows
-- Tracks shadow soldiers that users have extracted
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_shadows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shadow_id TEXT NOT NULL,
  custom_name TEXT NULL,
  level INT NOT NULL DEFAULT 1,
  experience BIGINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, shadow_id)
);

CREATE INDEX IF NOT EXISTS idx_user_shadows_user_id ON public.user_shadows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_shadows_active ON public.user_shadows(user_id, is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE public.user_shadows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own shadows"
  ON public.user_shadows FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shadows"
  ON public.user_shadows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shadows"
  ON public.user_shadows FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shadows"
  ON public.user_shadows FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT ALL ON public.user_shadows TO authenticated;

-- ============================================================================
-- TABLE: weekly_raids
-- Weekly raid boss challenges
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.weekly_raids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'hard',
  target_value NUMERIC NOT NULL,
  metric_key TEXT NOT NULL,
  xp_reward INT NOT NULL,
  bonus_rewards JSONB NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_raids_dates ON public.weekly_raids(week_start, week_end);

-- Enable RLS (raids are public to read)
ALTER TABLE public.weekly_raids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read raids"
  ON public.weekly_raids FOR SELECT
  TO authenticated
  USING (true);

GRANT SELECT ON public.weekly_raids TO authenticated;

-- ============================================================================
-- TABLE: user_raid_progress
-- User progress on weekly raids
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_raid_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raid_id UUID NOT NULL REFERENCES public.weekly_raids(id) ON DELETE CASCADE,
  current_value NUMERIC NOT NULL DEFAULT 0,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, raid_id)
);

CREATE INDEX IF NOT EXISTS idx_user_raid_progress_user_id ON public.user_raid_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_raid_progress_raid_id ON public.user_raid_progress(raid_id);

-- Trigger for updated_at
CREATE TRIGGER set_user_raid_progress_updated_at
  BEFORE UPDATE ON public.user_raid_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.user_raid_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own raid progress"
  ON public.user_raid_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own raid progress"
  ON public.user_raid_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own raid progress"
  ON public.user_raid_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.user_raid_progress TO authenticated;

-- ============================================================================
-- FUNCTION: Initialize user stats on first login
-- ============================================================================
CREATE OR REPLACE FUNCTION public.initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.level_state (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_init_stats'
  ) THEN
    CREATE TRIGGER on_auth_user_created_init_stats
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.initialize_user_stats();
  END IF;
END $$;

-- ============================================================================
-- FUNCTION: Check and unlock achievements
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_achievements(p_user_id UUID)
RETURNS TABLE(achievement_id TEXT, newly_unlocked BOOLEAN) AS $$
DECLARE
  v_quest_count INT;
  v_streak INT;
  v_level INT;
BEGIN
  -- Get user stats
  SELECT total_quests_completed INTO v_quest_count
  FROM public.user_stats
  WHERE user_id = p_user_id;
  
  SELECT current_streak INTO v_streak
  FROM public.streaks
  WHERE user_id = p_user_id;
  
  SELECT level INTO v_level
  FROM public.level_state
  WHERE user_id = p_user_id;
  
  -- Return results (actual achievement checking would be done in application code)
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
