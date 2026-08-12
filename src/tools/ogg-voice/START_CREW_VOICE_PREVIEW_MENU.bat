@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "PY=%SCRIPT_DIR%.venv\Scripts\python.exe"
set "SCRIPT=%SCRIPT_DIR%crew_voice_preview_menu.py"

if not exist "%PY%" (
  echo Fehler: Projekt-venv Python nicht gefunden:
  echo %PY%
  pause
  exit /b 1
)

set "PYTHONIOENCODING=utf-8"
"%PY%" "%SCRIPT%"
set "EXITCODE=%ERRORLEVEL%"

if not "%EXITCODE%"=="0" (
  echo.
  echo Vorschau mit Fehler beendet. Code: %EXITCODE%
  pause
)

exit /b %EXITCODE%