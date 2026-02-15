-- Migration: Create user fitness assessments table
-- This table stores honest rank assessments for users pursuing specific goals

-- User Fitness Assessments table
CREATE TABLE IF NOT EXISTS user_fitness_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES user_master_goals(id) ON DELETE SET NULL,
  
  -- Goal categorization
  goal_category TEXT NOT NULL,
  goal_text TEXT NOT NULL,
  
  -- Honest ranking
  honest_rank TEXT NOT NULL CHECK (honest_rank IN ('F', 'E', 'D', 'C', 'B', 'A', 'S')),
  percentile NUMERIC(5,2) NOT NULL CHECK (percentile >= 0 AND percentile <= 100),
  
  -- Assessment details
  assessment_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Contains: honestTruth, topOnePercentLooksLike, gapToTopOnePercent, 
  --           estimatedYearsToTop, immediateActions, growthMindsetMessage
  
  -- Metrics used for assessment
  metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Array of: { name, currentValue, unit, percentile, topOnePercentValue }
  
  -- Source data
  health_data_used BOOLEAN DEFAULT false,
  user_answers JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_fitness_assessments_user_id ON user_fitness_assessments(user_id);
CREATE INDEX idx_user_fitness_assessments_goal_id ON user_fitness_assessments(goal_id);
CREATE INDEX idx_user_fitness_assessments_category ON user_fitness_assessments(goal_category);
CREATE INDEX idx_user_fitness_assessments_rank ON user_fitness_assessments(honest_rank);
CREATE INDEX idx_user_fitness_assessments_date ON user_fitness_assessments(assessed_at DESC);

-- Get latest assessment for a user's goal
CREATE INDEX idx_user_fitness_assessments_latest 
  ON user_fitness_assessments(user_id, goal_category, assessed_at DESC);

-- Enable RLS
ALTER TABLE user_fitness_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own assessments"
  ON user_fitness_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON user_fitness_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
  ON user_fitness_assessments FOR UPDATE
  USING (auth.uid() = user_id);

-- Add honest_rank column to user_master_goals if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_master_goals' 
    AND column_name = 'honest_rank'
  ) THEN
    ALTER TABLE user_master_goals 
    ADD COLUMN honest_rank TEXT CHECK (honest_rank IN ('F', 'E', 'D', 'C', 'B', 'A', 'S'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_master_goals' 
    AND column_name = 'initial_percentile'
  ) THEN
    ALTER TABLE user_master_goals 
    ADD COLUMN initial_percentile NUMERIC(5,2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_master_goals' 
    AND column_name = 'goal_category'
  ) THEN
    ALTER TABLE user_master_goals 
    ADD COLUMN goal_category TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_master_goals' 
    AND column_name = 'assessment_id'
  ) THEN
    ALTER TABLE user_master_goals 
    ADD COLUMN assessment_id UUID REFERENCES user_fitness_assessments(id);
  END IF;
END $$;

-- Rank progression history table
CREATE TABLE IF NOT EXISTS rank_progression_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES user_master_goals(id) ON DELETE SET NULL,
  goal_category TEXT NOT NULL,
  
  -- Rank change
  old_rank TEXT CHECK (old_rank IN ('F', 'E', 'D', 'C', 'B', 'A', 'S')),
  new_rank TEXT NOT NULL CHECK (new_rank IN ('F', 'E', 'D', 'C', 'B', 'A', 'S')),
  old_percentile NUMERIC(5,2),
  new_percentile NUMERIC(5,2) NOT NULL,
  
  -- Context
  reason TEXT, -- 'initial_assessment', 'progress_update', 'achievement', 'regression'
  notes TEXT,
  
  -- Timestamps
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for rank progression
CREATE INDEX idx_rank_progression_user ON rank_progression_history(user_id);
CREATE INDEX idx_rank_progression_goal ON rank_progression_history(goal_id);
CREATE INDEX idx_rank_progression_date ON rank_progression_history(recorded_at DESC);

-- Enable RLS
ALTER TABLE rank_progression_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own rank history"
  ON rank_progression_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rank history"
  ON rank_progression_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update rank and log progression
CREATE OR REPLACE FUNCTION log_rank_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.honest_rank IS DISTINCT FROM NEW.honest_rank THEN
    INSERT INTO rank_progression_history (
      user_id, goal_id, goal_category,
      old_rank, new_rank, old_percentile, new_percentile,
      reason
    ) VALUES (
      NEW.user_id, NEW.id, NEW.goal_category,
      OLD.honest_rank, NEW.honest_rank, OLD.initial_percentile, NEW.initial_percentile,
      CASE 
        WHEN OLD.honest_rank IS NULL THEN 'initial_assessment'
        WHEN NEW.honest_rank > OLD.honest_rank THEN 'progress_update'
        ELSE 'regression'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rank changes
DROP TRIGGER IF EXISTS trigger_log_rank_change ON user_master_goals;
CREATE TRIGGER trigger_log_rank_change
  AFTER UPDATE ON user_master_goals
  FOR EACH ROW
  EXECUTE FUNCTION log_rank_change();

COMMENT ON TABLE user_fitness_assessments IS 'Stores honest rank assessments showing where users truly stand compared to their goal population';
COMMENT ON TABLE rank_progression_history IS 'Tracks rank changes over time to show user progress from initial rank toward top 1%';
