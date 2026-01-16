@echo off
cls
echo ========================================
echo   RPA Codegen Backend
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "server-simple.js" (
    echo ERROR: server-simple.js not found!
    echo Please run this from the backend folder
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server...
echo.
echo Server will run on: http://localhost:8000
echo Press Ctrl+C to stop
echo.
echo ========================================
echo.

node server-simple.js

pause
