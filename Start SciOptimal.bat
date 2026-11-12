@echo off
setlocal
cd /d "%~dp0"
set "PATH=%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;%LocalAppData%\Programs\nodejs;%PATH%"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install the LTS version from https://nodejs.org and then double-click this file again.
  pause
  exit /b 1
)
if not exist "%ProgramFiles%\Tailscale\tailscale.exe" (
  where tailscale >nul 2>&1
  if errorlevel 1 (
    echo Install Tailscale from https://tailscale.com/download/windows
    echo Open it and sign in once. It is free and does not ask for an API key.
    echo Then double-click this file again.
    pause
    exit /b 1
  )
)
if not exist "node_modules\" (
  echo Installing SciOptimal. This happens once.
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo Install failed.
    pause
    exit /b 1
  )
)
if not exist "build\index.html" (
  echo Building SciOptimal. This happens once.
  call npm run build
  if errorlevel 1 (
    echo Build failed.
    pause
    exit /b 1
  )
)
echo Leave this window open while you want the site on.
echo The iPhone address never changes. It is also saved in SciOptimal-link.txt
echo.
call npm run share
echo.
echo SciOptimal stopped.
pause
