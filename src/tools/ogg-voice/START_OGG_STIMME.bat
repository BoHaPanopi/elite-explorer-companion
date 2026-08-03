@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo OGG-Sprachserver ist noch nicht eingerichtet.
  echo Bitte zuerst INSTALLIEREN.bat starten.
  pause
  exit /b 1
)

".venv\Scripts\python.exe" ogg_voice_server.py
pause
