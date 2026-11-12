@echo off
setlocal
cd /d "%~dp0"
set "HERE=%~dp0"
if "%HERE:~-1%"=="\" set "HERE=%HERE:~0,-1%"
set "VBS=%TEMP%\scioptimal-startup.vbs"
> "%VBS%" echo Set sh = CreateObject("WScript.Shell")
>> "%VBS%" echo Set sc = sh.CreateShortcut(sh.ExpandEnvironmentStrings("%%APPDATA%%") ^& "\Microsoft\Windows\Start Menu\Programs\Startup\SciOptimal.lnk")
>> "%VBS%" echo sc.TargetPath = "%HERE%\Start SciOptimal.bat"
>> "%VBS%" echo sc.WorkingDirectory = "%HERE%"
>> "%VBS%" echo sc.WindowStyle = 1
>> "%VBS%" echo sc.Save
cscript //nologo "%VBS%"
if errorlevel 1 (
  echo Could not add SciOptimal to Windows startup.
  echo You can still double-click "Start SciOptimal.bat" whenever the PC is on.
  pause
  exit /b 1
)
echo SciOptimal will start when you sign in to Windows.
echo The iPhone address stays the same. Shutting down or sleeping the PC turns the site off until you are signed in again.
echo Starting it now.
start "SciOptimal" "%~dp0Start SciOptimal.bat"
