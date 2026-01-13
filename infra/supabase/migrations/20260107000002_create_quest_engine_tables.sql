-- Migration: Quest Completion Engine - Level/XP/Quests/Streaks
-- Floor 2, Step 1: Manual Quest Completion with XP and Leveling

-- ============================================================================
-- TABLE: level_state
-- Stores user's current level and XP
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.level_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level INT NOT NULL DEFAULT 1,
  xp BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_level_state_user_id ON public.level_state(user_id);

-- Trigger for updated_at
CREATE TRIGGER set_level_state_updated_at
  BEFORE UPDATE ON public.level_state
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.level_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own level_state"
  ON public.level_state FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own level_state"
  ON public.level_state FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own level_state"
  ON public.level_state FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own level_state"
  ON public.level_state FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT ALL ON public.level_state TO authenticated;

-- ============================================================================
-- TABLE: xp_ledger
-- Transaction log for all XP gains/losses
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.xp_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('quest', 'bonus', 'manual')),
  amount INT NOT NULL,
  quest_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_ledger_user_id ON public.xp_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_quest_id ON public.xp_ledger(quest_id) WHERE quest_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own xp_ledger"
  ON public.xp_ledger FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp_ledger"
  ON public.xp_ledger FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.xp_ledger TO authenticated;

-- ============================================================================
-- TABLE: quests
-- Daily quests with targets and states
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NULL REFERENCES public.goals(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'daily',
  title TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  metric_key TEXT NOT NULL DEFAULT 'manual',
  scheduled_for DATE NOT NULL,
  state TEXT NOT NULL DEFAULT 'assigned' CHECK (state IN ('assigned', 'passed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quests_user_id ON public.quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_scheduled_for ON public.quests(user_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_quests_goal_id ON public.quests(goal_id) WHERE goal_id IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER set_quests_updated_at
  BEFORE UPDATE ON public.quests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own quests"
  ON public.quests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quests"
  ON public.quests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests"
  ON public.quests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quests"
  ON public.quests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT ALL ON public.quests TO authenticated;

-- ============================================================================
-- TABLE: quest_attempts
-- Manual attempts at completing quests
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quest_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'manual',
  verified BOOLEAN NOT NULL DEFAULT false,
  observed_value NUMERIC NOT NULL,
  result TEXT NULL CHECK (result IS NULL OR result IN ('pass', 'fail')),
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quest_attempts_user_id ON public.quest_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_attempts_quest_id ON public.quest_attempts(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_attempts_attempted_at ON public.quest_attempts(user_id, attempted_at DESC);

-- Enable RLS
ALTER TABLE public.quest_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own quest_attempts"
  ON public.quest_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quest_attempts"
  ON public.quest_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quest_attempts"
  ON public.quest_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quest_attempts"
  ON public.quest_attempts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT ALL ON public.quest_attempts TO authenticated;

-- ============================================================================
-- TABLE: streaks
-- Track user streaks (daily verified completions, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_key TEXT NOT NULL DEFAULT 'daily_verified',
  current INT NOT NULL DEFAULT 0,
  best INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, streak_key)
);

CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);

-- Enable RLS
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own streaks"
  ON public.streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON public.streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON public.streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own streaks"
  ON public.streaks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT ALL ON public.streaks TO authenticated;
