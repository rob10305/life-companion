@echo off
title Life Companion Dashboard

echo.
echo  Life Companion - Personal Dashboard
echo  =====================================

:: Install dependencies if needed
if not exist node_modules (
    echo  Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo  [ERROR] npm install failed. Make sure Node.js is installed.
        pause
        exit /b 1
    )
)

echo  Starting dashboard at http://localhost:3000
echo  Press Ctrl+C to stop.
echo.

call npm run dev
pause
