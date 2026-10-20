@echo off
setlocal
chcp 65001 >nul
pushd "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 or newer is required. Install Node.js, then run this file again.
  pause
  popd
  exit /b 2
)
node dataCollector\dataValidator.js
set "validationExitCode=%ERRORLEVEL%"
echo.
echo Report: %CD%\reports\data-validation.md
pause
popd
exit /b %validationExitCode%
