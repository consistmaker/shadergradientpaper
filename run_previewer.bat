@echo off
title Motion Graphics 4K Live Previewer Studio
color 0A

echo ========================================================
echo   STARTING 4K MOTION GRAPHICS LIVE PREVIEWER STUDIO
echo ========================================================
echo.
echo Installing dependencies if needed...
call npm install
echo.
echo Launching Live Previewer Web Server...
echo Open your browser at http://localhost:5173
echo Press Ctrl+C in this window to stop the server.
echo.
call npm run dev
pause
