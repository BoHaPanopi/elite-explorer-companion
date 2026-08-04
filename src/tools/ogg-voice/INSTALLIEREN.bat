@echo off
setlocal
cd /d "%~dp0"

echo.
echo OGG Sprachserver wird eingerichtet...
echo.

where py >nul 2>nul
if errorlevel 1 (
  echo Python wurde nicht gefunden.
  echo Bitte Python 3 installieren und "Add Python to PATH" aktivieren.
  pause
  exit /b 1
)

py -m venv .venv
if errorlevel 1 goto :error

call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
if errorlevel 1 goto :error

python -m pip install edge-tts flask flask-cors pyinstaller
if errorlevel 1 goto :error

echo.
echo Fertig. Die Windows-Nebelkraehe ist ausgebaut.
call BUILD_OGG_STIMME.bat
if errorlevel 1 goto :error

echo Starte kuenftig START_OGG_STIMME.bat.
echo.
pause
exit /b 0

:error
echo.
echo Einrichtung fehlgeschlagen.
pause
exit /b 1
