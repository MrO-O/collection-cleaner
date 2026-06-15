@echo off
setlocal

cd /d "%~dp0"

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Install Node.js first, then run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo Starting collection-cleaner...
echo Local URL: http://127.0.0.1:5173/

start "" powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:5173/'"

call npm.cmd run dev -- --host 127.0.0.1 --port 5173
if errorlevel 1 (
  echo Dev server failed.
  pause
  exit /b 1
)
