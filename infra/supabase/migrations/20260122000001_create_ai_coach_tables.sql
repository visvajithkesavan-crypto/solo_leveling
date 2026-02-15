-- ============================================================================
-- Migration: AI Coach System Tables
-- Created: 2026-01-22
-- Description: Creates tables for AI-powered goal setting, daily quests,
--              weekly reviews, and milestone tracking
-- ============================================================================

-- ============================================================================
-- TABLE: user_master_goals
-- Stores the user's primary life goal analyzed by AI
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_master_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  analyzed_at TIMESTAMPTZ NULL,
  timeline_days INT NOT NULL DEFAULT 90,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index: Only one ACTIVE goal per user (allows multiple completed/abandoned)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_master_goals_one_active 
  ON public.user_master_goals(user_id) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_user_master_goals_user_id ON public.user_master_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_master_goals_status ON public.user_master_goals(status) WHERE status = 'active';

-- Trigger for updated_at
CREATE TRIGGER set_user_master_goals_updated_at
  BEFORE UPDATE ON public.user_master_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.user_master_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own master goals"
  ON public.user_master_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own master goals"
  ON public.user_master_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own master goals"
  ON public.user_master_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.user_master_goals TO authenticated;

-- ============================================================================
-- TABLE: master_plans
-- Stores AI-generated master plan for each goal
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.master_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.user_master_goals(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  phases JSONB NOT NULL DEFAULT '[]',
  daily_habits JSONB NOT NULL DEFAULT '[]',
  success_metrics JSONB NOT NULL DEFAULT '[]',
  milestones JSONB NOT NULL DEFAULT '[]',
  raw_ai_response JSONB NULL,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_master_plans_user_id ON public.master_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_master_plans_goal_id ON public.master_plans(goal_id);

-- Trigger for updated_at
CREATE TRIGGER set_master_plans_updated_at
  BEFORE UPDATE ON public.master_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.master_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own master plans"
  ON public.master_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own master plans"
  ON public.master_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own master plans"
  ON public.master_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.master_plans TO authenticated;

-- ============================================================================
-- TABLE: ai_daily_quests
-- Stores AI-generated daily quests linked to master plan
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NULL REFERENCES public.user_master_goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  quest_type TEXT NOT NULL,
  target_value NUMERIC NOT NULL DEFAULT 1,
  current_value NUMERIC NOT NULL DEFAULT 0,
  metric_key TEXT NOT NULL,
  xp_reward INT NOT NULL DEFAULT 50,
  stat_bonus TEXT NULL,
  scheduled_for DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  completed_at TIMESTAMPTZ NULL,
  ai_reasoning TEXT NULL,
  regeneration_count INT NOT NULL DEFAULT 0,
  phase_number INT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_daily_quests_user_id ON public.ai_daily_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_daily_quests_scheduled ON public.ai_daily_quests(user_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_ai_daily_quests_status ON public.ai_daily_quests(status);
CREATE INDEX IF NOT EXISTS idx_ai_daily_quests_goal ON public.ai_daily_quests(goal_id);

-- Trigger for updated_at
CREATE TRIGGER set_ai_daily_quests_updated_at
  BEFORE UPDATE ON public.ai_daily_quests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.ai_daily_quests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own ai daily quests"
  ON public.ai_daily_quests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai daily quests"
  ON public.ai_daily_quests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai daily quests"
  ON public.ai_daily_quests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai daily quests"
  ON public.ai_daily_quests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT ALL ON public.ai_daily_quests TO authenticated;

-- ============================================================================
-- TABLE: weekly_reviews
-- Stores AI-generated weekly performance reviews
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NULL REFERENCES public.user_master_goals(id) ON DELETE SET NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('excellent', 'good', 'adequate', 'needs_improvement', 'disappointing')),
  completion_rate NUMERIC NOT NULL DEFAULT 0,
  total_quests INT NOT NULL DEFAULT 0,
  completed_quests INT NOT NULL DEFAULT 0,
  xp_earned INT NOT NULL DEFAULT 0,
  streak_maintained BOOLEAN NOT NULL DEFAULT FALSE,
  stats_gained JSONB NOT NULL DEFAULT '{}',
  system_commentary TEXT NOT NULL,
  achievements_unlocked JSONB NOT NULL DEFAULT '[]',
  difficulty_adjustment TEXT NULL CHECK (difficulty_adjustment IN ('increase', 'decrease', 'maintain')),
  recommendations JSONB NOT NULL DEFAULT '[]',
  raw_ai_response JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_id ON public.weekly_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_dates ON public.weekly_reviews(week_start, week_end);
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_reviews_user_week ON public.weekly_reviews(user_id, week_start);

-- Enable RLS
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own weekly reviews"
  ON public.weekly_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reviews"
  ON public.weekly_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.weekly_reviews TO authenticated;

-- ============================================================================
-- TABLE: milestone_records
-- Tracks milestone progress and achievements
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.milestone_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NULL REFERENCES public.user_master_goals(id) ON DELETE SET NULL,
  plan_id UUID NULL REFERENCES public.master_plans(id) ON DELETE SET NULL,
  milestone_index INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NULL,
  target_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'missed')),
  completion_percentage NUMERIC NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NULL,
  celebration_message TEXT NULL,
  shadow_unlocked TEXT NULL,
  bonus_xp_awarded INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestone_records_user_id ON public.milestone_records(user_id);
CREATE INDEX IF NOT EXISTS idx_milestone_records_goal_id ON public.milestone_records(goal_id);
CREATE INDEX IF NOT EXISTS idx_milestone_records_status ON public.milestone_records(status);

-- Trigger for updated_at
CREATE TRIGGER set_milestone_records_updated_at
  BEFORE UPDATE ON public.milestone_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.milestone_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own milestones"
  ON public.milestone_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON public.milestone_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON public.milestone_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.milestone_records TO authenticated;

-- ============================================================================
-- TABLE: quest_regeneration_log
-- Tracks quest regeneration requests for rate limiting
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quest_regeneration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  regeneration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, regeneration_date)
);

CREATE INDEX IF NOT EXISTS idx_quest_regeneration_user ON public.quest_regeneration_log(user_id, regeneration_date);

-- Enable RLS
ALTER TABLE public.quest_regeneration_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own regeneration log"
  ON public.quest_regeneration_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own regeneration log"
  ON public.quest_regeneration_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own regeneration log"
  ON public.quest_regeneration_log FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.quest_regeneration_log TO authenticated;

-- ============================================================================
-- FUNCTION: Get active master goal for user
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_active_master_goal(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  goal_text TEXT,
  timeline_days INT,
  start_date DATE,
  target_date DATE,
  days_elapsed INT,
  days_remaining INT,
  progress_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.goal_text,
    g.timeline_days,
    g.start_date,
    g.target_date,
    (CURRENT_DATE - g.start_date)::INT as days_elapsed,
    (g.target_date - CURRENT_DATE)::INT as days_remaining,
    LEAST(100, GREATEST(0, 
      ((CURRENT_DATE - g.start_date)::NUMERIC / NULLIF(g.timeline_days, 0)) * 100
    )) as progress_percentage
  FROM public.user_master_goals g
  WHERE g.user_id = p_user_id
    AND g.status = 'active'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Get weekly stats for performance analysis
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_weekly_quest_stats(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  total_quests INT,
  completed_quests INT,
  failed_quests INT,
  skipped_quests INT,
  completion_rate NUMERIC,
  total_xp_earned INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INT as total_quests,
    COUNT(*) FILTER (WHERE q.status = 'completed')::INT as completed_quests,
    COUNT(*) FILTER (WHERE q.status = 'failed')::INT as failed_quests,
    COUNT(*) FILTER (WHERE q.status = 'skipped')::INT as skipped_quests,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE q.status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100
      ELSE 0
    END as completion_rate,
    COALESCE(SUM(q.xp_reward) FILTER (WHERE q.status = 'completed'), 0)::INT as total_xp_earned
  FROM public.ai_daily_quests q
  WHERE q.user_id = p_user_id
    AND q.scheduled_for BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Check regeneration limit
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_regeneration_limit(p_user_id UUID, p_max_regenerations INT DEFAULT 3)
RETURNS TABLE(
  can_regenerate BOOLEAN,
  regenerations_today INT,
  remaining INT
) AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COALESCE(r.count, 0) INTO v_count
  FROM public.quest_regeneration_log r
  WHERE r.user_id = p_user_id
    AND r.regeneration_date = CURRENT_DATE;
  
  v_count := COALESCE(v_count, 0);
  
  RETURN QUERY SELECT 
    v_count < p_max_regenerations,
    v_count,
    GREATEST(0, p_max_regenerations - v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Increment regeneration count
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_regeneration_count(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_new_count INT;
BEGIN
  INSERT INTO public.quest_regeneration_log (user_id, regeneration_date, count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, regeneration_date)
  DO UPDATE SET count = quest_regeneration_log.count + 1
  RETURNING count INTO v_new_count;
  
  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Grant execute on functions
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.get_active_master_goal TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_quest_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_regeneration_limit TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_regeneration_count TO authenticated;
