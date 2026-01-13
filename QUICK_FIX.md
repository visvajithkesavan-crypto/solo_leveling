# Quick Fix for "Cannot Fetch" Error

## TL;DR - Run These Commands

```powershell
# 1. Install Supabase CLI (one-time only)
npm install -g supabase

# 2. Start Docker Desktop (must be running)
# - Open Docker Desktop application
# - Wait for it to start (green icon)

# 3. Start Supabase database
cd c:\Users\visva\Documents\solo_leveling\infra\supabase
supabase start
# (Wait 5-10 minutes for first-time setup)

# 4. Run migrations
supabase db reset

# 5. Start API (new terminal)
cd c:\Users\visva\Documents\solo_leveling
pnpm api:dev

# 6. Start Web (new terminal)
cd c:\Users\visva\Documents\solo_leveling
pnpm web:dev
```

## Go to: http://localhost:3000

Registration should now work!

---

## What Was Wrong?

1. **Supabase wasn't running** - The authentication service needs a running database
2. **Missing environment variable** - Added `SUPABASE_ANON_KEY` to API config (already fixed)

The "cannot fetch" error appears when the web app tries to connect to Supabase, but Supabase isn't started.

---

## Don't Have Docker?

Download Docker Desktop: https://www.docker.com/products/docker-desktop/

It's required for Supabase to run locally.
