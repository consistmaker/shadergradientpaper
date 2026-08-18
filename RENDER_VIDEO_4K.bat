@echo off
title Antigravity 4K WebGL Batch Video Renderer (Local Studio)
color 0b

echo ========================================================================
echo        🎬 ANTIGRAVITY 4K WEBGL VIDEO RENDERER (LOCAL STUDIO)
echo ========================================================================
echo.

cd /d "%~dp0"

echo [1/3] Memeriksa & Menginstall modul Puppeteer...
call npm install puppeteer-core --legacy-peer-deps

echo.
echo [2/3] Membangun Aplikasi WebGL Studio (npm run build)...
call npm run build

echo.
echo [3/3] Memulai Proses Render Video 4K UHD (3840x2160)...
echo.
node local_renderer.cjs

echo.
echo ========================================================================
echo 🎉 SELESAI! Seluruh video 4K telah disimpan di folder:
echo    %~dp0output_4k_videos
echo ========================================================================
echo.
pause
