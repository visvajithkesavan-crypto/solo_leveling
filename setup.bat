@echo off
echo ================================================
echo Solo Leveling System - Complete Setup
echo ================================================
echo.

:: Check if Docker is running
docker version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo.
    echo Please start Docker Desktop and try again.
    echo Download Docker: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

:: Check if Supabase CLI is available
where supabase >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Supabase CLI is not installed!
    echo.
    echo Please install Supabase CLI using one of these methods:
    echo.
    echo Option 1 - Using Scoop (Windows Package Manager):
    echo   1. Install Scoop from: https://scoop.sh
    echo   2. Run: scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    echo   3. Run: scoop install supabase
    echo.
    echo Option 2 - Manual Download:
    echo   1. Go to: https://github.com/supabase/cli/releases
    echo   2. Download the Windows .exe file
    echo   3. Add it to your PATH
    echo.
    echo After installing, run this script again.
    echo.
    pause
    exit /b 1
)

echo [OK] Supabase CLI is installed
echo.

:: Install Node dependencies
echo [STEP 1/5] Installing dependencies...
call pnpm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo.

:: Start Supabase
echo [STEP 2/5] Starting Supabase (this may take 5-10 minutes first time)...
cd infra\supabase
call supabase start
if errorlevel 1 (
    echo [ERROR] Failed to start Supabase
    cd ..\..
    pause
    exit /b 1
)
echo.

:: Run migrations
echo [STEP 3/5] Running database migrations...
call supabase db reset
cd ..\..
echo.

:: Check environment files
echo [STEP 4/5] Checking environment configuration...
if not exist "apps\api\.env" (
    echo [ERROR] Missing apps\api\.env file
    pause
    exit /b 1
)
if not exist "apps\web\.env.local" (
    echo [ERROR] Missing apps\web\.env.local file
    pause
    exit /b 1
)
echo [OK] Environment files present
echo.

:: Instructions to start servers
echo [STEP 5/5] Setup complete!
echo.
echo ================================================
echo NEXT STEPS:
echo ================================================
echo.
echo 1. Start API server in a NEW terminal:
echo    pnpm api:dev
echo    (or double-click start-api.bat)
echo.
echo 2. Start Web app in ANOTHER terminal:
echo    pnpm web:dev
echo    (or double-click start-web.bat)
echo.
echo 3. Open browser: http://localhost:3000
echo.
echo ================================================
echo.
pause
