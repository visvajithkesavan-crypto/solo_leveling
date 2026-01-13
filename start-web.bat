@echo off
cd /d "%~dp0"
cd apps\web
call ..\..\node_modules\.bin\next dev
pause
