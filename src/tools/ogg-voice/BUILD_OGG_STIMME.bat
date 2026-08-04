@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo Die OGG-Python-Umgebung wurde nicht gefunden.
  echo Bitte zuerst INSTALLIEREN.bat ausfuehren.
  exit /b 1
)

call ".venv\Scripts\activate.bat"

python -c "import edge_tts, flask, flask_cors, PyInstaller" >nul 2>nul
if errorlevel 1 (
  echo Fehlende Build-Pakete werden installiert...
  python -m pip install edge-tts flask flask-cors pyinstaller
  if errorlevel 1 exit /b 1
)

if not exist "..\..\..\src-tauri\binaries" mkdir "..\..\..\src-tauri\binaries"

python -m PyInstaller ^
  --noconfirm ^
  --clean ^
  --onefile ^
  --noconsole ^
  --name ogg-voice-server-x86_64-pc-windows-msvc ^
  --distpath "..\..\..\src-tauri\binaries" ^
  --workpath ".build" ^
  --specpath ".build" ^
  --collect-all edge_tts ^
  ogg_voice_server.py

exit /b %errorlevel%
