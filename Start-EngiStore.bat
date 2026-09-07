@echo off
title EngiStore Pro Launcher
cd /d "%~dp0"

:: Launch EngiStore Pro silently in the background (zero black console window!)
start "" wscript.exe //nologo "%~dp0EngiStore-Launcher.vbs"
exit /b 0
