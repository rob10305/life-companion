@echo off
title Life Companion - Import Chrome Bookmarks
echo.
echo  Import Chrome Bookmarks to Life Companion
echo  ============================================
echo.
echo  This reads your Chrome bookmarks and pushes them to Supabase.
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0import-chrome-bookmarks.ps1"

echo.
pause
