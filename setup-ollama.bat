@echo off
echo ============================================================
echo   SOLO LEVELING SYSTEM - FREE AI SETUP (Ollama)
echo ============================================================
echo.
echo This will set up Ollama for FREE local AI inference.
echo No API keys needed, no costs!
echo.
PowerShell -ExecutionPolicy Bypass -File "%~dp0setup-ollama.ps1"
pause
