@echo off
setlocal

cd /d "%~dp0"

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

echo Starting local dev server...
echo URL: http://127.0.0.1:4321/
echo Press Ctrl+C to stop.
echo.

call npm run dev
pause
