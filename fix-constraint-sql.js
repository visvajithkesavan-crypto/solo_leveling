/**
 * Fix the unique constraint permanently
 */

require('dotenv').config({ path: './apps/api/.env' });
const { Client } = require('pg');

async function fixConstraint() {
  // Connect to Supabase PostgreSQL directly
  const connectionString = process.env.SUPABASE_URL.replace('http://', 'postgresql://postgres:postgres@').replace(':55431', ':55432');
  
  console.log('Connecting to database...');
  
  const client = new Client({
    connectionString: connectionString + '/postgres',
  });

  try {
    await client.connect();
    console.log('Connected!\n');

    // Drop the bad constraint
    console.log('Dropping bad constraint...');
    await client.query(`
      ALTER TABLE public.user_master_goals 
      DROP CONSTRAINT IF EXISTS user_master_goals_user_id_status_key;
    `);
    console.log('✓ Bad constraint dropped');

    // Create proper partial unique index
    console.log('Creating proper partial unique index...');
    await client.query(`
      DROP INDEX IF EXISTS idx_user_master_goals_one_active;
      CREATE UNIQUE INDEX idx_user_master_goals_one_active 
        ON public.user_master_goals(user_id) 
        WHERE status = 'active';
    `);
    console.log('✓ Proper unique index created');

    console.log('\n✅ Constraint fixed! Now only one ACTIVE goal per user is enforced.');
    console.log('Multiple completed/abandoned goals are now allowed.');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

fixConstraint();
