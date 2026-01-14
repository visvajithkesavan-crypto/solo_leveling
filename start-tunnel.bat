@echo off
echo ============================================
echo  Solo Leveling - Public URL Tunnel Setup
echo ============================================
echo.
echo Starting ngrok tunnels for:
echo   - Frontend (Next.js): localhost:3000
echo   - Backend (NestJS):   localhost:3004
echo.
echo IMPORTANT: After tunnels start, update your frontend's
echo NEXT_PUBLIC_API_URL in apps/web/.env.local to use the 
echo backend's public URL, then restart Next.js.
echo.
echo Press Ctrl+C to stop the tunnels.
echo ============================================
echo.
ngrok start --all --config ngrok.yml
