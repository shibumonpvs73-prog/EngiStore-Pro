@echo off
title Stop EngiStore Pro Background Server
color 0C
echo Stopping EngiStore Pro background services...
taskkill /F /IM node.exe >nul 2>&1
echo EngiStore Pro background server has been stopped.
timeout /t 2 >nul
exit /b 0
