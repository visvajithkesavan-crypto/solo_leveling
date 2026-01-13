@echo off
echo =====================================================
echo Supabase CLI Installation - Manual Method
echo =====================================================
echo.
echo Due to network issues, please manually download:
echo.
echo 1. Go to: https://github.com/supabase/cli/releases/latest
echo 2. Download: supabase_windows_amd64.zip
echo 3. Save it to: %TEMP%
echo.
echo After downloading, press any key to continue...
pause >nul

echo.
echo Extracting Supabase CLI...
if not exist "%TEMP%\supabase.zip" (
    echo ERROR: supabase_windows_amd64.zip not found in %TEMP%
    echo Please rename the downloaded file to: supabase.zip
    echo And place it in: %TEMP%
    pause
    exit /b 1
)

powershell -Command "Expand-Archive -Path '%TEMP%\supabase.zip' -DestinationPath '%TEMP%\supabase' -Force"

echo Creating Supabase directory...
if not exist "%USERPROFILE%\supabase" mkdir "%USERPROFILE%\supabase"

echo Copying executable...
copy /Y "%TEMP%\supabase\supabase.exe" "%USERPROFILE%\supabase\"

echo.
echo =====================================================
echo Installation Complete!
echo =====================================================
echo.
echo Supabase installed to: %USERPROFILE%\supabase\supabase.exe
echo.
echo NEXT STEPS:
echo 1. Add to PATH: Run this command in PowerShell (as Administrator):
echo    [System.Environment]::SetEnvironmentVariable('Path', $env:Path + ';%USERPROFILE%\supabase', [System.EnvironmentVariableTarget]::User)
echo.
echo 2. Or use it directly:
echo    %USERPROFILE%\supabase\supabase.exe --version
echo.
pause
