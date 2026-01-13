@echo off
cd /d "%~dp0"
cd apps\api
call pnpm start:dev
pause
