# Floor 2, Step 1: Quest Completion Engine - Implementation Summary

## 🎯 What Was Built

The smallest real gamification loop: **Quest Completion Engine with XP/Level/Streak mechanics** using manual (unverified) attempts.

---

## 📦 A) Database Migrations

**File:** [infra/supabase/migrations/20260107000002_create_quest_engine_tables.sql](infra/supabase/migrations/20260107000002_create_quest_engine_tables.sql)

### New Tables Created:

1. **`level_state`**
   - Stores user's current level and XP
   - Columns: `user_id` (PK), `level`, `xp`, `created_at`, `updated_at`
   - Index on `user_id`

2. **`xp_ledger`**
   - Transaction log for all XP gains
   - Columns: `id`, `user_id`, `source`, `amount`, `quest_id`, `created_at`
   - Indexes on `user_id` and `quest_id`

3. **`quests`**
   - Daily quests with targets and states
   - Columns: `id`, `user_id`, `goal_id`, `kind`, `title`, `target_value`, `metric_key`, `scheduled_for`, `state`, `created_at`, `updated_at`
   - Indexes on `user_id` and `(user_id, scheduled_for)`

4. **`quest_attempts`**
   - Manual attempts at completing quests
   - Columns: `id`, `user_id`, `quest_id`, `source`, `verified`, `observed_value`, `result`, `attempted_at`
   - Indexes on `user_id`, `quest_id`, and `attempted_at`

5. **`streaks`**
   - Track user streaks (daily verified completions)
   - Columns: `id`, `user_id`, `streak_key`, `current`, `best`, `updated_at`
   - Index on `user_id`
   - Unique constraint on `(user_id, streak_key)`

### RLS Policies:
- ✅ All tables have RLS enabled
- ✅ SELECT/INSERT/UPDATE/DELETE policies using `auth.uid() = user_id`
- ✅ Users can ONLY access their own rows

---

## 🧮 B) Shared Quest Formulas

**File:** [packages/shared/src/index.ts](packages/shared/src/index.ts)

### New Types & Enums:
- `QuestState`: assigned, passed, failed
- `AttemptResult`: pass, fail
- `XPSource`: quest, bonus, manual
- `QuestKind`: daily
- `LevelState`, `XPLedger`, `Quest`, `QuestAttempt`, `Streak` interfaces
- `StatusWindow`, `QuestResult`, `EvaluationResponse` interfaces
- `PopupEvent`, `PopupEventType` for frontend events

### XP Formulas:

```typescript
// Constants
BASE_XP = 50
VERIFIED_MULTIPLIER = 1.0
UNVERIFIED_MULTIPLIER = 0.4
MAX_STREAK_BONUS = 30
STREAK_BONUS_PER_DAY = 2

// XP Calculation
calculateQuestXp({ verified, currentStreak }) {
  multiplier = verified ? 1.0 : 0.4
  baseXp = 50 * multiplier
  streakBonus = min(currentStreak * 2, 30)
  return floor(baseXp + streakBonus)
}

// Level Threshold
xpToNextLevel(level) = 250 * level² + 750 * level

// Examples:
// Level 1 → 2: 1000 XP
// Level 2 → 3: 2500 XP
// Level 3 → 4: 4500 XP

// Apply XP with level-ups
applyXp(currentLevel, currentXp, xpGained) {
  // Handles multiple level-ups if enough XP gained
  // Returns: { level, xp, levelsGained }
}
```

---

## 🔧 C) API Implementation

### Engine Module

**Files:**
- [apps/api/src/engine/engine.module.ts](apps/api/src/engine/engine.module.ts)
- [apps/api/src/engine/engine.service.ts](apps/api/src/engine/engine.service.ts)
- [apps/api/src/engine/engine.controller.ts](apps/api/src/engine/engine.controller.ts)

**Endpoint:** `POST /api/v1/engine/evaluate-day?day=YYYY-MM-DD`

**Behavior:**
1. Fetch all quests for the specified day (`scheduled_for = day`)
2. For each quest:
   - Find latest attempt for that day
   - If no attempt → quest fails
   - If `observed_value >= target_value` → quest passes
   - Calculate XP based on `verified` flag and current streak
   - Insert XP into `xp_ledger`
   - Update quest `state` and attempt `result`
3. Apply total XP to `level_state` (handle level-ups)
4. Update streaks:
   - If ALL quests passed AND verified → increment `daily_verified` streak
   - Else → reset current streak to 0 (keep best)
5. Return response with:
   - Updated `statusWindow` data
   - `questResults` array
   - `popupEvents` for frontend

**Key Service Methods:**
```typescript
async evaluateDay(userId: string, day: string): Promise<EvaluationResponse>
async evaluateQuest(userId, quest, day, currentStreak): Promise<QuestResult>
async applyXpAndLevelUp(userId, xpGained): Promise<PopupEvent[]>
async updateStreaks(userId, allVerifiedPassed): Promise<void>
async getStatusWindow(userId): Promise<StatusWindow>
```

### Progress Module

**Files:**
- [apps/api/src/progress/progress.module.ts](apps/api/src/progress/progress.module.ts)
- [apps/api/src/progress/progress.service.ts](apps/api/src/progress/progress.service.ts)
- [apps/api/src/progress/progress.controller.ts](apps/api/src/progress/progress.controller.ts)

**Endpoint:** `GET /api/v1/progress/status-window`

**Returns:**
```typescript
{
  level: number,
  xp: number,
  xpToNext: number,  // calculated using xpToNextLevel(level)
  streak: number,
  bestStreak: number
}
```

### Module Registration

**Updated:** [apps/api/src/app.module.ts](apps/api/src/app.module.ts)
- Added `EngineModule` and `ProgressModule` to imports

---

## 🎨 D) Web Updates

### API Client Extensions

**File:** [apps/web/src/lib/api-client.ts](apps/web/src/lib/api-client.ts)

**New Methods:**
```typescript
async getStatusWindow(): Promise<StatusWindow>
async evaluateDay(day?: string): Promise<EvaluationResponse>
```

### New Components

**File:** [apps/web/src/components/PopupSystem.tsx](apps/web/src/components/PopupSystem.tsx)

**Components:**
- `SystemPopup` - Shows individual quest results, level-ups, etc.
- `PopupQueue` - Manages sequential display of multiple popup events

**Features:**
- Different styles for different event types (level-up, quest completed, quest failed)
- Animated entrance
- Click-through queue system

### Dashboard Updates

**File:** [apps/web/src/app/dashboard/page.tsx](apps/web/src/app/dashboard/page.tsx)

**Changes:**
1. **Status Window Integration:**
   - Now fetches real data from `/api/v1/progress/status-window`
   - Displays: Level, XP bar, Active Quests, Daily Streak
   - Shows XP progress with bar: `20 / 1000`

2. **Dev Tools Panel:**
   - Added "🔄 Run Daily Evaluation" button
   - Calls `/api/v1/engine/evaluate-day` for today
   - Shows evaluation results via popup queue
   - Warning label: "⚠️ DEV ONLY"

3. **Popup Event System:**
   - Renders `PopupQueue` component
   - Shows quest completions, failures, level-ups sequentially
   - Clears queue after user views all events

**New State:**
```typescript
const [statusWindow, setStatusWindow] = useState<StatusWindowData | null>(null);
const [popupEvents, setPopupEvents] = useState<PopupEvent[]>([]);
const [evaluating, setEvaluating] = useState(false);
```

---

## ✅ E) Verification Checklist

**File:** [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)

Comprehensive testing guide with 10 test scenarios:

1. **RLS User Isolation** - Verify users can't see each other's data
2. **Initial Status Window** - Check default values for new users
3. **Manual Quest Creation** - Create quests via SQL
4. **Unverified XP** - Test 40% multiplier (20 XP for base 50)
5. **Verified Quest & Streak** - Test 100% multiplier and streak increment
6. **Failed Quest (No Attempt)** - Verify automatic failure
7. **Failed Quest (Insufficient Value)** - Test target comparison
8. **Level Up Trigger** - Cross XP threshold
9. **Streak Bonus XP** - Test streak bonus calculation
10. **Multiple Quests Same Day** - Batch evaluation

---

## 🚀 How to Use

### Setup

```bash
# 1. Build shared package
pnpm shared:build

# 2. Run migrations
pnpm supabase:migrate

# 3. Start services
pnpm dev
```

### Testing Flow

1. **Sign in to dashboard** (http://localhost:3000)
2. **Check Status Window** - Should show Level 1, 0 XP, 0 streak
3. **Create test data** in Supabase Studio:
   ```sql
   -- Get your user_id
   SELECT id FROM auth.users WHERE email = 'your-email@test.com';
   
   -- Create a quest for today
   INSERT INTO quests (user_id, title, target_value, metric_key, scheduled_for, kind)
   VALUES ('<user_id>', 'Test Quest', 10, 'manual', CURRENT_DATE, 'daily');
   
   -- Create an attempt
   INSERT INTO quest_attempts (user_id, quest_id, observed_value, verified)
   VALUES ('<user_id>', '<quest_id>', 10, false);
   ```

4. **Click "Run Daily Evaluation"** button on dashboard
5. **View popup** showing quest completion (+20 XP for unverified)
6. **Check Status Window** - Should show 20 XP / 1000

---

## 🎯 Key Features

✅ **RLS Security:** All quest engine tables have user_id isolation
✅ **Shared Formulas:** XP/level calculations in packages/shared
✅ **Manual Attempts:** Quest completion via database inserts
✅ **XP System:** Base 50 XP, 40% for unverified, 100% for verified
✅ **Leveling:** Formula-based thresholds (250*level² + 750*level)
✅ **Streaks:** Daily verified quest completion tracking
✅ **Streak Bonus:** +2 XP per day (max 30)
✅ **Quest Evaluation:** Batch evaluation of all quests for a day
✅ **Popup Events:** Visual feedback for quest results and level-ups
✅ **Status Window:** Real-time level, XP, and streak display

---

## 🔒 Security

- **Server-side user_id:** API extracts from JWT, client can't manipulate
- **RLS on all tables:** Database enforces user isolation
- **Auth guard:** All endpoints protected by Supabase JWT validation
- **Double security:** Both API layer and DB layer verify user_id

---

## 📊 Database Schema Summary

```
level_state (user progress)
├── user_id → auth.users
├── level (int)
└── xp (bigint)

xp_ledger (transaction history)
├── user_id → auth.users
├── source (quest/bonus/manual)
├── amount (int)
└── quest_id → quests

quests (daily tasks)
├── user_id → auth.users
├── goal_id → goals (optional)
├── kind (daily)
├── target_value (numeric)
├── scheduled_for (date)
└── state (assigned/passed/failed)

quest_attempts (user submissions)
├── user_id → auth.users
├── quest_id → quests
├── observed_value (numeric)
├── verified (boolean)
└── result (pass/fail)

streaks (tracking)
├── user_id → auth.users
├── streak_key (daily_verified)
├── current (int)
└── best (int)
```

---

## 🎮 What's NOT in This Build

- ❌ Automatic quest generation from goals
- ❌ Health Connect integration (real verification)
- ❌ Penalties for missed quests
- ❌ Automated scheduling/evaluation
- ❌ Quest rewards/achievements
- ❌ Multiple quest types (weekly, monthly)
- ❌ Difficulty-based XP multipliers
- ❌ AI-generated quest suggestions

---

## 📝 Files Changed/Created

### Database
- ✅ `infra/supabase/migrations/20260107000002_create_quest_engine_tables.sql` (NEW)

### Shared Package
- ✅ `packages/shared/src/index.ts` (UPDATED - added quest engine types/formulas)

### API
- ✅ `apps/api/src/app.module.ts` (UPDATED - added modules)
- ✅ `apps/api/src/engine/engine.module.ts` (NEW)
- ✅ `apps/api/src/engine/engine.service.ts` (NEW)
- ✅ `apps/api/src/engine/engine.controller.ts` (NEW)
- ✅ `apps/api/src/progress/progress.module.ts` (NEW)
- ✅ `apps/api/src/progress/progress.service.ts` (NEW)
- ✅ `apps/api/src/progress/progress.controller.ts` (NEW)

### Web
- ✅ `apps/web/src/lib/api-client.ts` (UPDATED - added methods)
- ✅ `apps/web/src/components/PopupSystem.tsx` (NEW)
- ✅ `apps/web/src/app/dashboard/page.tsx` (UPDATED - status window + evaluation)

### Documentation
- ✅ `VERIFICATION_CHECKLIST.md` (NEW)
- ✅ `FLOOR2_STEP1_SUMMARY.md` (THIS FILE)

---

## 🎓 Usage Example

```typescript
// 1. Create quests in DB (via SQL or future API endpoint)
INSERT INTO quests (user_id, title, target_value, scheduled_for)
VALUES ('uuid', '100 pushups', 100, '2026-01-07');

// 2. User logs attempt
INSERT INTO quest_attempts (user_id, quest_id, observed_value, verified)
VALUES ('uuid', 'quest-uuid', 105, false);

// 3. System evaluates (API call)
POST /api/v1/engine/evaluate-day?day=2026-01-07

// 4. Response:
{
  "statusWindow": { level: 1, xp: 20, xpToNext: 1000, streak: 0 },
  "questResults": [{ 
    quest_id: "...", 
    title: "100 pushups", 
    state: "passed", 
    xp_earned: 20 
  }],
  "popupEvents": [{
    type: "quest_completed",
    title: "Quest Completed!",
    message: "100 pushups +20 XP"
  }]
}
```

---

## ✅ Implementation Complete

All deliverables have been implemented:
- ✅ Database migrations with RLS
- ✅ Shared quest formulas
- ✅ NestJS engine + progress modules
- ✅ Web dashboard updates
- ✅ Verification checklist

**Ready for testing!** 🚀
