@echo off
title EngiStore Pro - System Setup & Installation
color 1F
cls

echo ================================================================
echo           ENGISTORE PRO - WINDOWS SYSTEM SETUP
echo         Engineering Purchase, Store ^& Inventory System
echo ================================================================
echo.
echo [Step 1/3] Checking system prerequisites...

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not installed on this computer.
    echo Node.js is required to run EngiStore Pro locally.
    echo.
    echo Please download and install Node.js (LTS version) from:
    echo   https://nodejs.org/
    echo.
    echo After installing Node.js, run this Install-EngiStore.bat file again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is detected on your system.
node -v

echo.
echo [Step 2/3] Installing application dependencies...
call npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    echo [ERROR] Dependency installation failed. Please check internet connection.
    pause
    exit /b 1
)

echo.
echo [Step 3/3] Creating EngiStore Pro Desktop Shortcut with App Icon...
cscript //nologo "%~dp0Create-Desktop-Shortcut.vbs"

echo.
echo ================================================================
echo [SUCCESS] EngiStore Pro has been successfully set up on your system!
echo A shortcut named "EngiStore Pro" with the official App Icon has
echo been created on your Windows Desktop.
echo ================================================================
echo.
set /p START_NOW="Do you want to launch EngiStore Pro now? (Y/N): "
if /i "%START_NOW%"=="Y" (
    start "" wscript.exe //nologo "%~dp0EngiStore-Launcher.vbs"
)
exit /b 0
