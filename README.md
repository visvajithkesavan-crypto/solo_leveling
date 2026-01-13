# Solo Leveling System - Getting Started

A gamified self-development platform inspired by Solo Leveling. This is the first vertical slice: user authentication, goal creation, and a Quest Board UI backed by Supabase with Row Level Security.

## 🏗️ Project Structure

```
solo_leveling/
├── apps/
│   ├── api/                    # NestJS API server
│   │   ├── src/
│   │   │   ├── goals/         # Goals CRUD endpoints
│   │   │   ├── health/        # Health check endpoints
│   │   │   ├── supabase/      # Auth guard & Supabase client
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── web/                    # Next.js 14 (App Router)
│       ├── src/
│       │   ├── app/           # Pages (auth, dashboard)
│       │   ├── components/    # System UI components
│       │   └── lib/           # Auth context, API client
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared TypeScript types
│       └── src/index.ts       # Goal, Quest enums, DTOs
│
├── infra/
│   └── supabase/
│       ├── migrations/        # SQL migrations with RLS
│       └── config.toml        # Supabase local config
│
└── package.json               # Monorepo root
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- pnpm >= 8
- Docker Desktop (for Supabase local) - **REQUIRED**
- Supabase CLI - See installation instructions below

### 1. Install Dependencies

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install all workspace dependencies
pnpm install
```

### 2. Install Supabase CLI

**Windows (Using Scoop):**
```powershell
# Install Scoop if needed
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Install Supabase
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Or download manually:** https://github.com/supabase/cli/releases

### 3. Start Supabase Locally

```bash
# Make sure Docker Desktop is running first!

# Initialize and start Supabase
pnpm supabase:start
# OR
cd infra/supabase
supabase start
```

⏱️ **First time takes 5-10 minutes** - downloads Docker images

**Important:** Copy the output values:
- `API URL` (typically http://localhost:54321)
- `anon key`
- `service_role key`

### 3. Configure Environment Variables

**For API** (`apps/api/.env`):
```bash
cp apps/api/.env.example apps/api/.env
```
Edit `apps/api/.env`:
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<your_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
PORT=3001
NODE_ENV=development
```

**For Web** (`apps/web/.env.local`):
```bash
cp apps/web/.env.example apps/web/.env.local
```
Edit `apps/web/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Run Migrations

```bash
pnpm supabase:migrate
```

This creates the `goals` table and enables RLS policies.

### 5. Build Shared Package

```bash
pnpm shared:build
```

### 6. Start Development Servers

**Option 1: Start all services together**
```bash
pnpm dev
```

**Option 2: Start individually**
```bash
# Terminal 1: API
pnpm api:dev

# Terminal 2: Web
pnpm web:dev
```

### 7. Access the App

- **Web App:** http://localhost:3000
- **API:** http://localhost:3001/api
- **Supabase Studio:** http://localhost:54323

## 📋 Testing the Application

### Create Your First Goal

1. Navigate to http://localhost:3000
2. Click "Begin Journey" → Sign Up
3. Create account with email/password
4. You'll be redirected to the Dashboard
5. Click "+ New Quest"
6. Enter a goal title and click "Create Quest"
7. Your goal appears in the Quest Board!

### Verify the Health Endpoint

```bash
curl http://localhost:3001/api/health/simple
```

Expected response:
```json
{
  "ok": true,
  "timestamp": "2026-01-07T...",
  "service": "Solo Leveling API"
}
```

## 🔒 How Authentication & RLS Work

### JWT Flow

1. **User signs in** via Next.js → Supabase Auth issues JWT
2. **Next.js client** stores JWT automatically (in cookies/localStorage)
3. **API requests** include JWT in `Authorization: Bearer <token>` header
4. **NestJS AuthGuard** validates JWT using Supabase client:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser(token);
   ```
5. **Supabase validates:**
   - JWT signature (using secret key)
   - Token expiration
   - Token structure
6. **User ID extracted** from validated JWT
7. **RLS policies** use `auth.uid()` which matches the user ID from JWT

### RLS Security

The database has these policies on the `goals` table:

```sql
-- Users can only SELECT their own goals
CREATE POLICY "Users can read own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only INSERT with their own user_id
CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

**Server-side security:**
- API explicitly sets `user_id` from authenticated token
- Client cannot override `user_id` in requests
- Even if client tries to manipulate data, RLS policies block it

## ✅ RLS Verification Checklist

### Test 1: Basic Functionality
- [ ] Sign up with User A
- [ ] Create 2-3 goals as User A
- [ ] Verify goals appear in dashboard
- [ ] Delete one goal
- [ ] Sign out

### Test 2: Verify Isolation Between Users
- [ ] Sign up with User B (different email)
- [ ] Verify User B sees NO goals initially
- [ ] Create 1 goal as User B
- [ ] Verify User B sees only their 1 goal
- [ ] Sign out

### Test 3: Re-verify User A's Data
- [ ] Sign in as User A again
- [ ] Verify User A still sees their original goals (NOT User B's)
- [ ] This confirms RLS is working!

### Test 4: Direct Database Query (Advanced)

Open Supabase Studio (http://localhost:54323):

1. Go to SQL Editor
2. Run query:
   ```sql
   SELECT id, user_id, title, created_at FROM goals;
   ```
3. You should see ALL goals from ALL users
4. Note the different `user_id` values

Now test RLS is active:
```sql
-- This should return only YOUR goals when run from client
SELECT * FROM goals WHERE user_id = auth.uid();
```

### Test 5: API Token Manipulation (Security Test)

Try to manipulate requests (requires tools like Postman):

1. Sign in as User A, get token from browser DevTools
2. Try to create a goal with User B's `user_id`:
   ```bash
   curl -X POST http://localhost:3001/api/v1/goals \
     -H "Authorization: Bearer <user_a_token>" \
     -H "Content-Type: application/json" \
     -d '{"title": "Hack attempt", "user_id": "<user_b_id>"}'
   ```
3. **Expected:** Server ignores client's `user_id` and uses authenticated user's ID
4. **Result:** Goal is created for User A, not User B (RLS protection working!)

### Test 6: No Token = No Access

```bash
curl http://localhost:3001/api/v1/goals
```

**Expected:** `401 Unauthorized` error

## 📊 Database Schema

```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for RLS performance
CREATE INDEX idx_goals_user_id ON goals(user_id);

-- RLS enabled
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
```

## 🎯 API Endpoints

### Health Check
- `GET /api/health` - Terminus health check
- `GET /api/health/simple` - Simple OK response

### Goals (Authenticated)
- `GET /api/v1/goals` - List user's goals
- `POST /api/v1/goals` - Create goal
  ```json
  {
    "title": "Complete 100 push-ups daily",
    "description": "Optional description",
    "difficulty": "C_RANK"
  }
  ```
- `GET /api/v1/goals/:id` - Get specific goal
- `DELETE /api/v1/goals/:id` - Delete goal

## 🎨 UI Components

### System Window
Reusable panel component with signature Solo Leveling look:
```tsx
<SystemWindow title="STATUS WINDOW">
  {/* content */}
</SystemWindow>
```

### Quest Card
Individual quest/goal display with delete functionality:
```tsx
<QuestCard
  title="My Goal"
  description="Description"
  createdAt="2026-01-07"
  onDelete={() => handleDelete()}
/>
```

### Status Bar
Displays stats with progress bars:
```tsx
<StatusBar label="Level" value={5} maxValue={10} color="gold" />
```

## 🛠️ Available Scripts

```bash
# Development
pnpm dev              # Start all services
pnpm api:dev          # Start API only
pnpm web:dev          # Start web only

# Build
pnpm build            # Build all packages
pnpm shared:build     # Build shared package

# Supabase
pnpm supabase:start   # Start local Supabase
pnpm supabase:stop    # Stop local Supabase
pnpm supabase:status  # Check Supabase status
pnpm supabase:migrate # Run/reset migrations
```

## 🐛 Troubleshooting

### "Cannot Fetch" Error During Registration ⚠️

**Cause:** Supabase database is not running.

**Solution:**
1. Make sure Docker Desktop is running (green icon)
2. Start Supabase: `cd infra/supabase && supabase start`
3. Verify: `supabase status` (should show all services running)
4. Restart API and Web servers

📖 **See [FIX_NOW.md](FIX_NOW.md) for detailed step-by-step instructions**

### "Command 'supabase' not found"

**Solution:** Install Supabase CLI:
- **Windows:** Use Scoop (see Prerequisites section)
- **Manual:** Download from https://github.com/supabase/cli/releases

### "Docker daemon is not running"

**Solution:** 
- Open Docker Desktop application
- Wait for it to fully start (green icon in system tray)
- Try `supabase start` again

### "Module not found: @solo-leveling/shared"
```bash
pnpm shared:build
```

### "Missing Supabase configuration"
- Verify `.env` files are created (not just `.env.example`)
- Verify you copied the keys from `pnpm supabase:start` output

### Port already in use
```bash
# Check what's using the port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Or use different ports in .env files
```

### Supabase won't start
- Ensure Docker Desktop is running
- Try: `pnpm supabase:stop` then `pnpm supabase:start`

### Goals not showing after creation
- Check browser console for errors
- Verify API is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

## 📖 Next Steps

This vertical slice demonstrates:
- ✅ Authentication with Supabase
- ✅ Row Level Security working correctly
- ✅ API with health check + CRUD
- ✅ Next.js UI with Solo Leveling theme
- ✅ Monorepo structure with shared types

Future enhancements (not in this slice):
- Health Connect integration for fitness tracking
- Penalties/rewards system
- Quest difficulty and XP
- Level progression
- Daily quests
- Achievement system

## 📝 Notes

- Using pnpm workspaces for monorepo management
- NestJS with Terminus for health checks
- Next.js 14 App Router with client components
- Supabase Auth with JWT validation
- Tailwind with custom Solo Leveling theme
- TypeScript throughout

---

**Built with ⚔️ by a Hunter seeking to level up**
