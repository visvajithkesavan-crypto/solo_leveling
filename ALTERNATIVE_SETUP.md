# Alternative Setup - Using Docker Compose Directly

Since you're experiencing network issues with installing Supabase CLI, here's an alternative approach using Docker Compose directly.

## Quick Start (No Supabase CLI Needed)

### 1. Start Supabase with Docker Compose

Create a docker-compose file and start services:

```powershell
cd c:\Users\visva\Documents\solo_leveling

# Start all services
docker-compose -f infra/supabase/docker-compose.yml up -d
```

### 2. Wait for Services to Start

```powershell
# Check if containers are running
docker ps
```

You should see containers for:
- supabase-db (PostgreSQL)
- supabase-auth (GoTrue)
- supabase-rest (PostgREST)
- supabase-realtime
- supabase-storage
- supabase-studio

### 3. Apply Database Migrations

```powershell
# Connect to the database and run migrations
docker exec -it supabase-db psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/20260107000001_create_goals_table.sql
docker exec -it supabase-db psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/20260107000002_create_quest_engine_tables.sql
```

### 4. Verify Supabase is Running

Open in browser:
- Supabase Studio: http://localhost:54323
- API Health: http://localhost:54321/rest/v1/

### 5. Start Your Servers

```powershell
# Terminal 1
pnpm api:dev

# Terminal 2 (new terminal)
pnpm web:dev
```

### 6. Test the App

Go to: http://localhost:3000 and try registering!

---

## Troubleshooting Network Issues

If you're still having connectivity problems:

### Option A: Use Mobile Hotspot
1. Enable mobile hotspot on your phone
2. Connect your PC to the hotspot
3. Try installing Supabase CLI again:
   ```powershell
   pnpm dlx supabase --version
   ```

### Option B: Download Manually
1. On another device with internet, download:
   https://github.com/supabase/cli/releases/download/v2.71.3/supabase_windows_amd64.zip
2. Transfer to your PC via USB drive
3. Run: `install-supabase-manual.bat`

### Option C: Try Different DNS
```powershell
# Switch to Google DNS
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2

# Then try again
pnpm dlx supabase --version
```

---

## Once You Get Supabase CLI Installed

Run these commands:

```powershell
cd c:\Users\visva\Documents\solo_leveling\infra\supabase

# Start Supabase
supabase start

# Run migrations
supabase db reset
```

Then start your servers as normal.
