# IMMEDIATE FIX - Run These Commands Now

## The Problem
Your "cannot fetch" error is because **Supabase database is not running**.

## Quick Solution (5 Minutes)

### Step 1: Install Supabase CLI

**Choose ONE method:**

#### Method A: Using Scoop (Easiest)
```powershell
# Install Scoop package manager (if not installed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Install Supabase
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Method B: Manual Download (Alternative)
1. Go to: https://github.com/supabase/cli/releases/latest
2. Download `supabase_windows_amd64.zip` or `supabase_windows_arm64.zip`
3. Extract the `supabase.exe` file
4. Move it to `C:\Program Files\Supabase\` (create folder if needed)
5. Add `C:\Program Files\Supabase\` to your PATH:
   - Search "Environment Variables" in Windows
   - Click "Environment Variables"
   - Under "System variables", find "Path"
   - Click "Edit" → "New" → Add `C:\Program Files\Supabase\`
   - Click OK on all windows
6. **Restart PowerShell/Terminal**

### Step 2: Verify Installation
```powershell
supabase --version
```
Should show version number (e.g., `1.226.4`)

### Step 3: Start Supabase
```powershell
cd c:\Users\visva\Documents\solo_leveling\infra\supabase
supabase start
```

⏱️ **First time takes 5-10 minutes** - it downloads Docker images. Be patient!

### Step 4: Run Database Migrations
```powershell
# Still in infra\supabase folder
supabase db reset
```

### Step 5: Start the Servers

**Terminal 1 (API):**
```powershell
cd c:\Users\visva\Documents\solo_leveling
pnpm api:dev
```

**Terminal 2 (Web) - Open a NEW terminal:**
```powershell
cd c:\Users\visva\Documents\solo_leveling
pnpm web:dev
```

### Step 6: Test Registration
1. Open browser: http://localhost:3000
2. Click "Sign Up"
3. Register with any email (e.g., test@example.com, password: test123)
4. Should work now! ✅

---

## Troubleshooting

### "Docker is not running"
- Open Docker Desktop
- Wait for it to show "Docker Desktop is running" (green icon)
- Try again

### "Command 'supabase' not found" after installation
- Close and reopen PowerShell/Terminal
- Make sure you added Supabase to PATH (Method B users)

### Still getting "cannot fetch"?
Check each service is running:

```powershell
# 1. Check Supabase
cd infra\supabase
supabase status
# Should show all services running

# 2. Check API
# Visit: http://localhost:3004/api/health
# Should return: {"status":"ok",...}

# 3. Check Web
# Visit: http://localhost:3000
# Should see the landing page
```

---

## Already Fixed
✅ Added missing `SUPABASE_ANON_KEY` to API config
✅ Environment variables are correct
✅ Code is working - just need Supabase running!

---

## Daily Workflow (After Initial Setup)

```powershell
# 1. Make sure Docker Desktop is running

# 2. Start Supabase (if not already running)
cd c:\Users\visva\Documents\solo_leveling\infra\supabase
supabase start

# 3. Start servers
cd c:\Users\visva\Documents\solo_leveling
pnpm api:dev    # Terminal 1
pnpm web:dev    # Terminal 2
```

Or just double-click: `start-all.bat`
