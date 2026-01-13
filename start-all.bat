@echo off
echo ============================================
echo Starting Solo Leveling System Servers
echo ============================================
echo.
echo This will start BOTH the API and Web servers
echo Press Ctrl+C to stop
echo.

:: Check if Docker is running
docker version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)

:: Check if Supabase is running
where supabase >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Supabase CLI not found in PATH
    echo Please run setup.bat first
    pause
    exit /b 1
)

:: Check Supabase status
cd infra\supabase
supabase status >nul 2>&1
if errorlevel 1 (
    echo [INFO] Supabase is not running. Starting...
    call supabase start
    if errorlevel 1 (
        echo [ERROR] Failed to start Supabase
        cd ..\..
        pause
        exit /b 1
    )
)
cd ..\..

echo [OK] Supabase is running
echo.
echo Starting servers...
echo - API: http://localhost:3004
echo - Web: http://localhost:3000
echo - Supabase Studio: http://localhost:54323
echo.

:: Start both servers (they'll run in the same window)
start "Solo Leveling API" cmd /k "cd %~dp0 && pnpm api:dev"
timeout /t 3 /nobreak >nul
start "Solo Leveling Web" cmd /k "cd %~dp0 && pnpm web:dev"

echo.
echo Servers starting in separate windows...
echo Close those windows to stop the servers.
echo.
pause
