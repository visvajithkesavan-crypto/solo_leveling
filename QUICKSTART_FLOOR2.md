# Quick Start Guide - Quest Completion Engine

## 🚀 Get Running in 3 Steps

```bash
# 1. Build shared package (required after adding new types)
pnpm shared:build

# 2. Apply database migrations (creates 5 new tables)
pnpm supabase:migrate

# 3. Start everything
pnpm dev
```

Visit: http://localhost:3000

---

## 🧪 Quick Test (2 minutes)

### 1. Get Your User ID
```sql
-- In Supabase Studio (http://localhost:54323)
SELECT id, email FROM auth.users;
```

### 2. Create Test Quest
```sql
INSERT INTO quests (user_id, title, target_value, metric_key, scheduled_for, kind)
VALUES 
  ('<YOUR_USER_ID>', 'Test Quest', 10, 'manual', CURRENT_DATE, 'daily');
```

### 3. Create Attempt
```sql
-- Get quest_id first
SELECT id, title FROM quests WHERE user_id = '<YOUR_USER_ID>';

-- Create passing attempt
INSERT INTO quest_attempts (user_id, quest_id, observed_value, verified)
VALUES 
  ('<YOUR_USER_ID>', '<QUEST_ID>', 10, false);
```

### 4. Run Evaluation
Click **"🔄 Run Daily Evaluation"** button on dashboard

### 5. Verify Results
- ✅ Popup shows "Quest Completed! +20 XP"
- ✅ Status Window shows: XP: 20 / 1000
- ✅ Level remains 1

---

## 📊 XP Quick Reference

| Scenario | XP Calculation | Example |
|----------|---------------|---------|
| Unverified quest | 50 × 0.4 + streak_bonus | 20 XP (no streak) |
| Verified quest | 50 × 1.0 + streak_bonus | 50 XP (no streak) |
| With 5-day streak | 50 + min(5×2, 30) | 60 XP (verified) |
| With 20-day streak | 50 + min(20×2, 30) | 80 XP (capped) |

**Streak Bonus:** `min(current_streak × 2, 30)`  
**Max Bonus:** 30 XP (at streak ≥ 15 days)

---

## 🎯 Level Thresholds

| Level | XP Required | Formula |
|-------|-------------|---------|
| 1 → 2 | 1,000 | 250×1² + 750×1 |
| 2 → 3 | 2,500 | 250×2² + 750×2 |
| 3 → 4 | 4,500 | 250×3² + 750×3 |
| 4 → 5 | 7,000 | 250×4² + 750×4 |

**General Formula:** `250 × level² + 750 × level`

---

## 🔄 Evaluation Logic

When you click "Run Daily Evaluation":

1. **Fetch quests** for today
2. **For each quest:**
   - Find latest attempt
   - No attempt? → FAIL
   - `observed_value < target_value`? → FAIL
   - `observed_value >= target_value`? → PASS
3. **Calculate XP** (verified flag + current streak)
4. **Insert XP** into ledger
5. **Update level** (handle multiple level-ups)
6. **Update streaks:**
   - All passed + all verified? → Increment
   - Any failed? → Reset to 0

---

## 🛠️ API Endpoints

```bash
# Get status window
GET /api/v1/progress/status-window
Authorization: Bearer <token>

# Evaluate day
POST /api/v1/engine/evaluate-day?day=2026-01-07
Authorization: Bearer <token>
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| [infra/supabase/migrations/20260107000002_create_quest_engine_tables.sql](infra/supabase/migrations/20260107000002_create_quest_engine_tables.sql) | 5 tables + RLS |
| [packages/shared/src/index.ts](packages/shared/src/index.ts) | XP formulas |
| [apps/api/src/engine/](apps/api/src/engine/) | Evaluation logic |
| [apps/api/src/progress/](apps/api/src/progress/) | Status window |
| [apps/web/src/components/PopupSystem.tsx](apps/web/src/components/PopupSystem.tsx) | Event popups |
| [apps/web/src/app/dashboard/page.tsx](apps/web/src/app/dashboard/page.tsx) | UI integration |

---

## 🔍 Debugging

```sql
-- Check level state
SELECT * FROM level_state WHERE user_id = '<ID>';

-- Check XP history
SELECT * FROM xp_ledger WHERE user_id = '<ID>' ORDER BY created_at DESC;

-- Check quests today
SELECT * FROM quests WHERE user_id = '<ID>' AND scheduled_for = CURRENT_DATE;

-- Check attempts
SELECT * FROM quest_attempts WHERE user_id = '<ID>' ORDER BY attempted_at DESC;

-- Check streak
SELECT * FROM streaks WHERE user_id = '<ID>';
```

---

## ✅ Checklist Before Testing

- [ ] `pnpm shared:build` completed
- [ ] `pnpm supabase:migrate` applied
- [ ] API running on http://localhost:3001
- [ ] Web running on http://localhost:3000
- [ ] Signed in to dashboard
- [ ] Status Window visible

---

## 📚 Full Documentation

- **Complete Summary:** [FLOOR2_STEP1_SUMMARY.md](FLOOR2_STEP1_SUMMARY.md)
- **Testing Guide:** [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)
- **Project README:** [README.md](README.md)

---

**Questions?** Check [FLOOR2_STEP1_SUMMARY.md](FLOOR2_STEP1_SUMMARY.md) for detailed explanations.
