@echo off
title Life Companion - Build & Deploy

echo.
echo  Life Companion - Build for Deployment
echo  ========================================

if not exist node_modules (
    echo  Installing dependencies first...
    call npm install
)

echo  Building production bundle...
call npm run build

if errorlevel 1 (
    echo.
    echo  [ERROR] Build failed. Check the errors above.
    pause
    exit /b 1
)

echo.
echo  Build complete! To deploy:
echo.
echo  Vercel:   npx vercel
echo  Netlify:  npx netlify-cli deploy --prod
echo.
echo  Or drag the .next folder to netlify.com/drop
echo.
pause
