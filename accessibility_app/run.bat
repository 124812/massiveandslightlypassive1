@echo off
title ElevenLabs and Google Gemini for Accessibility
echo ==========================================================
echo ElevenLabs and Google Gemini for Accessibility
echo ==========================================================

echo Stopping any old servers...
taskkill /f /im node.exe > NUL 2>&1
taskkill /f /im python.exe > NUL 2>&1

echo Starting Local Web Server...
:: Serve from the root directory so the browser can access the jupyter notebook file!
cd ..

if exist ".venv\Scripts\python.exe" (
    start /B .venv\Scripts\python.exe -m http.server 8000 > accessibility_app/server.log 2>&1
) else (
    start /B python -m http.server 8000 > accessibility_app/server.log 2>&1
)

echo Waiting for server to start...
timeout /t 3 /nobreak > NUL

echo Opening Frontend in your browser...
:: Open the deeply nested frontend URL
start http://localhost:8000/accessibility_app/frontend/

echo.
echo Everything is running smoothly! 
echo Frontend: http://localhost:8000/accessibility_app/frontend/
echo.
echo Press any key to stop the server and close...
pause > NUL

taskkill /f /im python.exe > NUL 2>&1
echo Closed successfully.
