# Floor 2, Step 1: Quest Completion Engine - Verification Checklist

## 🎯 Implementation Complete

This checklist verifies that the Quest Completion Engine with XP/Level/Streak mechanics is working correctly.

## 📋 Setup Instructions

### 1. Build & Start Services

```bash
# Build shared package (required after changes)
pnpm shared:build

# Run migrations
pnpm supabase:migrate

# Start API & Web
pnpm dev
```

### 2. Get Supabase Keys

Make sure your `.env` files have the correct Supabase keys from `pnpm supabase:start` output.

---

## ✅ Verification Tests

### Test 1: RLS - User Isolation

**Goal:** Verify users can only access their own quest engine data

**Steps:**
1. Sign up as User A (user-a@test.com)
2. Open Supabase Studio (http://localhost:54323)
3. Go to SQL Editor and run:
   ```sql
   SELECT * FROM level_state;
   SELECT * FROM xp_ledger;
   SELECT * FROM quests;
   SELECT * FROM quest_attempts;
   SELECT * FROM streaks;
   ```
4. Note User A's `user_id`
5. Sign up as User B (user-b@test.com) in a different browser/incognito
6. Run the same SQL queries
7. Verify User B sees ONLY their own rows (different `user_id`)

**Expected Result:**
- ✅ Each user has separate records
- ✅ No cross-user data visibility
- ✅ RLS policies are enforcing isolation

---

### Test 2: Initial Status Window

**Goal:** Verify status window shows default values for new users

**Steps:**
1. Sign in as a new user
2. Check the STATUS WINDOW panel on dashboard
3. Observe the values

**Expected Result:**
- ✅ Level: 1
- ✅ XP: 0 / 1000 (xpToNext for level 1 = 250*1² + 750*1 = 1000)
- ✅ Daily Streak: 0 🔥 (Best: 0)
- ✅ Active Quests: 0

---

### Test 3: Manual Quest Creation & Attempt

**Goal:** Create quests and attempts manually via Supabase Studio

**Steps:**
1. Get your `user_id` from Supabase Studio:
   ```sql
   SELECT id, email FROM auth.users;
   ```

2. Create a quest for today:
   ```sql
   INSERT INTO quests (user_id, title, target_value, metric_key, scheduled_for, kind)
   VALUES (
     '<your_user_id>',
     'Complete 10 pushups',
     10,
     'manual',
     CURRENT_DATE,
     'daily'
   );
   ```

3. Get the quest_id:
   ```sql
   SELECT id, title FROM quests WHERE user_id = '<your_user_id>';
   ```

4. Create a passing attempt:
   ```sql
   INSERT INTO quest_attempts (user_id, quest_id, observed_value, verified)
   VALUES (
     '<your_user_id>',
     '<quest_id>',
     10,  -- meets target of 10
     false  -- unverified attempt
   );
   ```

**Expected Result:**
- ✅ Quest created successfully
- ✅ Attempt created successfully
- ✅ No RLS errors

---

### Test 4: Run Quest Evaluation - Unverified XP

**Goal:** Verify XP calculation for unverified quest completion

**Steps:**
1. On dashboard, click **"🔄 Run Daily Evaluation"** button
2. Observe popup events
3. Check STATUS WINDOW for updated values

**Expected XP Calculation:**
- Base XP: 50
- Unverified multiplier: 0.4
- Current streak: 0
- Streak bonus: min(0 * 2, 30) = 0
- **Total XP: (50 * 0.4) + 0 = 20 XP**

**Expected Result:**
- ✅ Popup shows "Quest Completed! +20 XP"
- ✅ Level remains 1
- ✅ XP: 20 / 1000
- ✅ Daily Streak: 0 (stays 0 because unverified)
- ✅ Quest state changes from "assigned" to "passed"

**Verify in DB:**
```sql
-- Check quest state
SELECT id, title, state FROM quests WHERE user_id = '<your_user_id>';

-- Check XP ledger
SELECT source, amount, quest_id FROM xp_ledger WHERE user_id = '<your_user_id>';

-- Check level state
SELECT level, xp FROM level_state WHERE user_id = '<your_user_id>';
```

---

### Test 5: Verified Quest Attempt & Streak

**Goal:** Verify verified attempts earn full XP and increment streak

**Steps:**
1. Create another quest for today:
   ```sql
   INSERT INTO quests (user_id, title, target_value, metric_key, scheduled_for, kind)
   VALUES (
     '<your_user_id>',
     'Drink 8 glasses of water',
     8,
     'manual',
     CURRENT_DATE,
     'daily'
   );
   ```

2. Create a **verified** passing attempt:
   ```sql
   INSERT INTO quest_attempts (user_id, quest_id, observed_value, verified)
   VALUES (
     '<your_user_id>',
     '<new_quest_id>',
     8,
     true  -- VERIFIED
   );
   ```

3. Click **"🔄 Run Daily Evaluation"** again

**Expected XP Calculation:**
- Base XP: 50
- Verified multiplier: 1.0
- Current streak: 0 (will become 1 after this)
- Streak bonus: 0
- **Total XP: (50 * 1.0) + 0 = 50 XP**

**Expected Result:**
- ✅ Popup shows "Quest Completed! +50 XP"
- ✅ Level still 1
- ✅ XP: 70 / 1000 (20 + 50)
- ✅ Daily Streak: 1 🔥 (incremented!)
- ✅ Best Streak: 1

---

### Test 6: Failed Quest (No Attempt)

**Goal:** Verify quests fail when no attempt is made

**Steps:**
1. Create a quest for today with no attempt:
   ```sql
   INSERT INTO quests (user_id, title, target_value, metric_key, scheduled_for, kind)
   VALUES (
     '<your_user_id>',
     'Read for 30 minutes',
     30,
     'manual',
     CURRENT_DATE,
     'daily'
   );
   ```

2. Click **"🔄 Run Daily Evaluation"**

**Expected Result:**
- ✅ Popup shows "Quest Failed - Better luck next time"
- ✅ Quest state = "failed"
- ✅ No XP earned
- ✅ Daily Streak reset to 0 (one failed quest breaks streak)

---

### Test 7: Failed Quest (Insufficient Value)

**Goal:** Verify quests fail when observed_value < target_value

**Steps:**
1. Create quest:
   ```sql
   INSERT INTO quests (user_id, title, target_value, metric_key, scheduled_for, kind)
   VALUES ('<your_user_id>', 'Run 5 km', 5, 'manual', CURRENT_DATE, 'daily');
   ```

2. Create attempt with insufficient value:
   ```sql
   INSERT INTO quest_attempts (user_id, quest_id, observed_value, verified)
   VALUES ('<your_user_id>', '<quest_id>', 3, true);  -- Only 3, need 5
   ```

3. Run evaluation

**Expected Result:**
- ✅ Popup shows "Quest Failed"
- ✅ Quest state = "failed"
- ✅ No XP earned
- ✅ attempt.result = "fail"

---

### Test 8: Level Up Trigger

**Goal:** Verify level-up occurs when XP threshold is crossed

**Steps:**
1. Check current XP in STATUS WINDOW
2. Add enough XP manually to trigger level-up:
   ```sql
   -- If you have 70 XP, you need 930 more to reach 1000
   INSERT INTO xp_ledger (user_id, source, amount)
   VALUES ('<your_user_id>', 'manual', 930);
   
   -- Update level_state
   UPDATE level_state 
   SET xp = 1000 
   WHERE user_id = '<your_user_id>';
   ```

3. Create and complete one more quest to trigger evaluation
4. Run evaluation

**Expected Result:**
- ✅ Popup shows "⚡ LEVEL UP! ⚡ You've reached Level 2!"
- ✅ Level: 2
- ✅ XP: 0 / 2000 (new threshold: 250*4 + 750*2 = 2500)
- ✅ Remaining XP rolls over

**XP to Next Level Formula Verification:**
- Level 1 → 2: 250*1² + 750*1 = 1000
- Level 2 → 3: 250*2² + 750*2 = 2500
- Level 3 → 4: 250*3² + 750*3 = 4500

---

### Test 9: Streak Bonus XP

**Goal:** Verify streak bonus increases XP

**Steps:**
1. Manually set streak to 10:
   ```sql
   UPDATE streaks 
   SET current = 10, best = 10 
   WHERE user_id = '<your_user_id>' AND streak_key = 'daily_verified';
   ```

2. Create and complete a verified quest
3. Run evaluation

**Expected XP Calculation:**
- Base XP: 50
- Verified multiplier: 1.0
- Current streak: 10
- Streak bonus: min(10 * 2, 30) = 20
- **Total XP: (50 * 1.0) + 20 = 70 XP**

**Expected Result:**
- ✅ Quest completion awards 70 XP (not 50)
- ✅ Streak increments to 11
- ✅ Streak bonus capped at 30 (when streak ≥ 15)

---

### Test 10: Multiple Quests Same Day

**Goal:** Verify all quests for a day are evaluated together

**Steps:**
1. Create 3 quests for today
2. Create verified passing attempts for all 3
3. Run evaluation once

**Expected Result:**
- ✅ All 3 quests evaluated in one call
- ✅ 3 popup events shown sequentially
- ✅ Total XP = sum of all quests
- ✅ Streak increments only once (not 3 times)
- ✅ If ANY quest fails, streak resets

---

## 🔧 Troubleshooting

### No XP gained
- Check `xp_ledger` table for entries
- Verify `source = 'quest'` and `amount > 0`
- Check quest `state` changed to "passed"

### Streak not incrementing
- Verify ALL quests have `verified = true` attempts
- Check if any quest failed (breaks streak)
- Confirm `streaks` table has row with `streak_key = 'daily_verified'`

### Level not updating
- Check `level_state` table
- Verify XP calculation: current_xp + gained_xp >= xpToNextLevel
- Look for level-up popup event

### RLS errors
- Verify `user_id` in insert matches authenticated user
- Check Supabase Studio shows your user_id correctly
- Confirm RLS policies exist: `SELECT * FROM pg_policies;`

---

## 📊 Database Inspection Queries

```sql
-- Full user status overview
SELECT 
  ls.level,
  ls.xp,
  s.current as streak,
  s.best as best_streak,
  COUNT(q.id) as total_quests
FROM level_state ls
LEFT JOIN streaks s ON ls.user_id = s.user_id AND s.streak_key = 'daily_verified'
LEFT JOIN quests q ON ls.user_id = q.user_id
WHERE ls.user_id = '<your_user_id>'
GROUP BY ls.level, ls.xp, s.current, s.best;

-- XP history
SELECT created_at, source, amount, quest_id 
FROM xp_ledger 
WHERE user_id = '<your_user_id>' 
ORDER BY created_at DESC;

-- Quest results for today
SELECT 
  q.title,
  q.state,
  q.target_value,
  qa.observed_value,
  qa.verified,
  qa.result
FROM quests q
LEFT JOIN quest_attempts qa ON q.id = qa.quest_id
WHERE q.user_id = '<your_user_id>' 
  AND q.scheduled_for = CURRENT_DATE;
```

---

## ✅ Final Checklist

- [ ] Database migration applied successfully
- [ ] All 5 tables created with RLS enabled
- [ ] Status window shows real API data (not mocked)
- [ ] Quest evaluation button works
- [ ] Unverified attempts earn 40% XP (multiplier 0.4)
- [ ] Verified attempts earn 100% XP (multiplier 1.0)
- [ ] Streak increments only when ALL quests verified and passed
- [ ] Streak breaks when any quest fails
- [ ] Level-up triggers popup when XP threshold crossed
- [ ] XP formula matches specification
- [ ] Popup events display correctly
- [ ] User A cannot see User B's data (RLS working)

---

## 🎮 Next Steps (Not in This Build)

Future enhancements:
- Automatic quest generation from goals
- Health Connect integration for verified attempts
- Penalties for missed quests
- Quest rewards and achievements
- Multiple quest types (weekly, monthly)
- Difficulty-based XP multipliers
