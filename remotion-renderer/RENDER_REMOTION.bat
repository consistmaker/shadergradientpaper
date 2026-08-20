@echo off
title Remotion 4K/FHD Video Batch Renderer Studio
color 0a

echo ========================================================================
echo        🎬 REMOTION VIDEO RENDERER STUDIO (LOCAL BATCH)
echo ========================================================================
echo.

cd /d "%~dp0"

echo [1/3] Memeriksa & Menginstall modul Remotion...
call npm install --legacy-peer-deps

echo.
echo [2/3] Memulai Proses Render Batch Menggunakan Remotion Engine...
echo.
node render_batch.mjs

echo.
echo ========================================================================
echo 🎉 SELESAI! Seluruh video Remotion telah disimpan di folder:
echo    %~dp0out
echo ========================================================================
echo.
pause
