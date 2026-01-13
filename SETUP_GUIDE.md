# Solo Leveling - Complete Setup Guide

## Problem: "Cannot Fetch" Error During Registration

This error occurs because **Supabase is not running locally**. Here's how to fix it:

---

## Step-by-Step Setup

### 1. Install Supabase CLI

**Option A: Using npm (Recommended for Windows)**
```powershell
npm install -g supabase
```

**Option B: Using Scoop (Windows Package Manager)**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Option C: Manual Download**
- Download from: https://github.com/supabase/cli/releases
- Extract and add to your PATH

### 2. Verify Installation
```powershell
supabase --version
```

### 3. Install Docker Desktop

Supabase requires Docker to run locally.

- Download from: https://www.docker.com/products/docker-desktop/
- Install and start Docker Desktop
- Wait for Docker to fully start (check the system tray icon)

### 4. Start Supabase

```powershell
# From the project root
cd infra/supabase
supabase start
```

**This will take 5-10 minutes the first time** as it downloads Docker images.

When complete, you'll see output like:
```
API URL: http://localhost:54321
...
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Run Database Migrations

```powershell
# Still in infra/supabase directory
supabase db reset
```

This creates the necessary tables (goals, quest engine tables).

### 6. Start the Application

Open **TWO separate terminals**:

**Terminal 1 - API Server:**
```powershell
cd c:\Users\visva\Documents\solo_leveling
pnpm api:dev
```

**Terminal 2 - Web App:**
```powershell
cd c:\Users\visva\Documents\solo_leveling
pnpm web:dev
```

Or use the batch files:
```powershell
# Terminal 1
.\start-api.bat

# Terminal 2
.\start-web.bat
```

### 7. Access the Application

- Web App: http://localhost:3000
- API: http://localhost:3004
- Supabase Studio: http://localhost:54323

---

## Quick Start Commands (After Initial Setup)

```powershell
# 1. Start Supabase (if not already running)
cd infra/supabase
supabase start

# 2. Start API (in new terminal)
pnpm api:dev

# 3. Start Web (in another new terminal)
pnpm web:dev
```

---

## Common Issues & Solutions

### Issue: "supabase: command not found"
**Solution:** Supabase CLI is not installed. See Step 1 above.

### Issue: "Cannot connect to the Docker daemon"
**Solution:** 
- Open Docker Desktop
- Wait for it to fully start (green icon in system tray)
- Try `supabase start` again

### Issue: "Port already in use"
**Solution:**
```powershell
# Check what's using the port
netstat -ano | findstr :54321

# Kill the process if needed
taskkill /PID <process_id> /F

# Or stop and restart Supabase
supabase stop
supabase start
```

### Issue: "Cannot fetch" during registration
**Solution:** This means one of the following isn't running:
1. Supabase is not started → Run `supabase start`
2. API server is not running → Run `pnpm api:dev`
3. Check the browser console for the exact error

### Issue: Dependencies not installed
**Solution:**
```powershell
# Install pnpm globally
npm install -g pnpm

# Install project dependencies
pnpm install
```

---

## Verify Everything is Working

1. **Check Supabase:**
   ```powershell
   cd infra/supabase
   supabase status
   ```
   Should show all services running.

2. **Check API:**
   - Visit http://localhost:3004/api/health
   - Should return: `{"status":"ok","info":{...}}`

3. **Check Web App:**
   - Visit http://localhost:3000
   - Should see the landing page

4. **Test Registration:**
   - Go to http://localhost:3000/auth/signup
   - Create an account with any email (e.g., test@example.com)
   - Should redirect to dashboard after success

---

## Stop Everything

```powershell
# Stop Supabase
cd infra/supabase
supabase stop

# Stop API and Web servers
# Press Ctrl+C in each terminal window
```

---

## Environment Variables (Already Configured)

Your `.env` files are already set up correctly:

**apps/api/.env:**
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3004
NODE_ENV=development
```

**apps/web/.env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:3004
```

---

## Still Having Issues?

1. Check the browser console (F12) for detailed error messages
2. Check the API terminal for error logs
3. Verify Docker Desktop is running
4. Restart all services in order: Supabase → API → Web
