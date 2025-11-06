@echo off
chcp 65001 >nul
echo ════════════════════════════════════════════════════════════
echo.
echo   🔥 Ryazhenka Chat PRO - Borealis Installation 🔥
echo.
echo ════════════════════════════════════════════════════════════
echo.

REM Check DevkitPro
if not defined DEVKITPRO (
    echo ❌ DevkitPro not found!
    echo Please install DevkitPro first!
    pause
    exit /b 1
)

echo ✅ DevkitPro found: %DEVKITPRO%
echo.

echo [1/5] Installing Borealis...
%DEVKITPRO%\msys2\usr\bin\bash.exe -lc "sudo dkp-pacman -S --noconfirm switch-borealis"

echo.
echo [2/5] Installing SDL2...
%DEVKITPRO%\msys2\usr\bin\bash.exe -lc "sudo dkp-pacman -S --noconfirm switch-sdl2 switch-sdl2_image"

echo.
echo [3/5] Installing image libraries...
%DEVKITPRO%\msys2\usr\bin\bash.exe -lc "sudo dkp-pacman -S --noconfirm switch-libjpeg-turbo switch-libpng switch-libwebp"

echo.
echo [4/5] Creating romfs directory...
if not exist "romfs\fonts" mkdir romfs\fonts

echo.
echo [5/5] Downloading Russian font...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/google/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf' -OutFile 'romfs\fonts\NotoSans.ttf'"

if exist "romfs\fonts\NotoSans.ttf" (
    echo ✅ Font downloaded successfully!
) else (
    echo ⚠️ Font download failed! Download manually:
    echo https://github.com/google/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf
)

echo.
echo ════════════════════════════════════════════════════════════
echo.
echo   ✅ Installation Complete!
echo.
echo   Now you can compile:
echo   make clean
echo   make
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause
