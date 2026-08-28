@echo off
setlocal
cd /d "%~dp0"
echo ============================================
echo EngiStore Pro - Windows Build
 echo ============================================
where node >nul 2>&1 || (echo Node.js is not installed. Install Node.js LTS first.&pause&exit /b 1)
where npm >nul 2>&1 || (echo npm is not available.&pause&exit /b 1)
if not exist node_modules (
  echo Installing Electron and electron-builder...
  call npm install --no-audit --no-fund
  if errorlevel 1 (echo npm install failed.&pause&exit /b 1)
)
echo Building Windows installer...
call npm run build
if errorlevel 1 (echo Build failed.&pause&exit /b 1)
echo.
echo BUILD COMPLETE. Check the dist folder for the EngiStore Pro installer.
pause
