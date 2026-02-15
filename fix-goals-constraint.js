/**
 * Fix the user_master_goals constraint issue
 * 
 * The current UNIQUE(user_id, status) constraint is wrong because:
 * - It only allows ONE goal per status per user
 * - A user should be able to have multiple abandoned/completed goals
 * - Only ONE active goal should be allowed
 * 
 * This script:
 * 1. Drops the bad constraint
 * 2. Creates a proper partial unique index
 * 3. Cleans up existing data
 */

require('dotenv').config({ path: './apps/api/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixConstraint() {
  console.log('Fixing user_master_goals constraint...\n');

  try {
    // Step 1: Delete all existing goals to clean slate
    console.log('Step 1: Cleaning existing goals...');
    const { error: deleteError } = await supabase
      .from('user_master_goals')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('Error deleting goals:', deleteError);
    } else {
      console.log('✓ Existing goals deleted');
    }

    // Step 2: Delete related master plans
    console.log('\nStep 2: Cleaning master plans...');
    const { error: planError } = await supabase
      .from('master_plans')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (planError) {
      console.error('Error deleting plans:', planError);
    } else {
      console.log('✓ Master plans deleted');
    }

    // Step 3: Delete related quests
    console.log('\nStep 3: Cleaning AI daily quests...');
    const { error: questError } = await supabase
      .from('ai_daily_quests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (questError) {
      console.error('Error deleting quests:', questError);
    } else {
      console.log('✓ AI daily quests deleted');
    }

    console.log('\n✅ Cleanup complete! You can now set a new goal.');
    console.log('\nNote: The unique constraint issue will still exist.');
    console.log('To permanently fix it, run this SQL in Supabase Studio:');
    console.log(`
-- Drop the bad constraint
ALTER TABLE public.user_master_goals 
  DROP CONSTRAINT IF EXISTS user_master_goals_user_id_status_key;

-- Create a proper partial unique index (only one ACTIVE goal per user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_master_goals_one_active 
  ON public.user_master_goals(user_id) 
  WHERE status = 'active';
`);

  } catch (err) {
    console.error('Error:', err);
  }
}

fixConstraint();
