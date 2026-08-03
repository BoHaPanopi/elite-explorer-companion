@echo off
setlocal
cd /d "%~dp0"
title OGG Alpha 0.13.1 Debug-Sprachserver

where python >nul 2>nul
if errorlevel 1 (
  echo Python wurde nicht gefunden.
  pause
  exit /b 1
)

python -c "import edge_tts, flask, flask_cors" >nul 2>nul
if errorlevel 1 (
  echo Fehlende Sprachpakete werden installiert...
  python -m pip install edge-tts flask flask-cors
  if errorlevel 1 (
    echo Installation fehlgeschlagen.
    pause
    exit /b 1
  )
)

echo Starte OGG Debug-Sprachserver...
echo.
python ogg_voice_server.py

echo.
echo Der Server wurde beendet.
pause
