@echo off
setlocal

cd /d "%~dp0"
set "URL=http://127.0.0.1:4321/"

echo Kubtel site launcher
echo Project: %CD%
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or is not available in PATH.
  echo Install Node.js 22 LTS or newer, then run this file again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm is not installed or is not available in PATH.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -Uri '%URL%' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } exit 1 } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 (
  echo Local site is already running.
  echo URL: %URL%
  start "" "%URL%"
  echo.
  pause
  exit /b 0
)

echo Starting local dev server...
echo URL: %URL%
echo Press Ctrl+C to stop.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 2; Start-Process '%URL%'" >nul 2>nul
call npm run dev
pause
