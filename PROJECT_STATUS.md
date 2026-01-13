# 🚀 Solo Leveling System - ✅ RUNNING!

## Services Status

### ✅ Web Application (Next.js)
- **URL**: http://localhost:3000
- **Status**: ✅ **RUNNING**
- **Features**: Dashboard, Auth UI, Goals CRUD, Manual Steps Form
- **Note**: Use `start-web.bat` to restart if needed

### ✅ API Server (NestJS)
- **URL**: http://localhost:3004/api
- **Status**: ✅ **RUNNING**
- **Note**: Use `start-api.bat` to restart if needed
- **Endpoints**:
  - `GET /api/health/simple` - Health check
  - `GET /api/v1/goals` - List goals
  - `POST /api/v1/goals` - Create goal
  - `DELETE /api/v1/goals/:id` - Delete goal
  - `POST /api/v1/engine/evaluate-day` - Evaluate quests
  - `GET /api/v1/progress/status-window` - Get player status
  - `POST /api/v1/ingest/health/daily-summary` - Ingest Health Connect data

### ⚠️ Supabase (Local)
- **Status**: Not Running (requires Docker Desktop)
- **Required for**: Authentication, Database
- **Install**: Download Docker Desktop from https://www.docker.com/products/docker-desktop/
- **Start command**: `cd infra/supabase && pnpm supabase:start`

## What You Can Do Now

### Without Supabase (Limited Functionality)
- Browse the UI at http://localhost:3003
- See the landing page and dashboard layout
- API endpoints are accessible but will fail without database

### With Supabase (Full Functionality)
1. **Install Docker Desktop** (required)
2. **Start Supabase**:
   ```powershell
   cd c:\Users\visva\Documents\solo_leveling\infra\supabase
   pnpm supabase:start
   ```
3. **Apply migrations**:
   ```powershell
   pnpm supabase:migrate
   ```
4. **Sign up** at http://localhost:3003
5. **Create goals** and track progress
6. **Log steps** manually
7. **Run evaluations** to earn XP
8. **Level up** and track streaks

## Phase 1 Testing (Requires Supabase)

Once Supabase is running, follow the comprehensive testing guide in the response above to:
- Test authentication and RLS
- Create quests and attempts
- Verify XP calculations
- Test level-up mechanics
- Validate user isolation

## Phase 2: Android App (Future)

After Phase 1 passes all tests:
- Build Android app with Health Connect integration
- Read verified step data from device
- Sync to backend for verified XP (50 XP vs 20 XP unverified)
- Automatic streak tracking with verified data

## Next Steps

1. **Install Docker Desktop** (if you want full functionality)
2. **Restart Supabase** once Docker is installed
3. **Test Phase 1** using the detailed testing procedures provided
4. **Build Android app** once Phase 1 is verified

## Current Project Structure

```
solo_leveling/
├── apps/
│   ├── api/              ✅ Running on port 3004
│   ├── web/              ✅ Running on port 3003
│   └── android/          📱 Created, ready to build
├── packages/
│   └── shared/           ✅ Built successfully
├── infra/
│   └── supabase/         ⚠️ Requires Docker
└── pnpm-workspace.yaml   ✅ Configured
```

## Environment Files Created

- `apps/api/.env` - API configuration (Supabase connection)
- `apps/web/.env.local` - Web configuration (API URL)

Both are configured to use:
- Supabase: http://localhost:54321
- API: http://localhost:3004

## Troubleshooting

### Port Already in Use
If ports 3003 or 3004 are in use:
```powershell
# Kill processes on specific ports
netstat -ano | findstr :3003
netstat -ano | findstr :3004
```

### Restart Services
```powershell
# API
cd c:\Users\visva\Documents\solo_leveling
pnpm --filter @solo-leveling/api start:dev

# Web
pnpm --filter @solo-leveling/web dev
```

### Rebuild Shared Package
```powershell
cd packages/shared
pnpm build
```

---

**Status**: 🟢 Web and API are running! Install Docker Desktop to enable full functionality with Supabase.
