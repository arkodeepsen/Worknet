@echo off
REM Navigate to the directory containing the package.json file
cd /d "%~dp0"

REM Activate the Python virtual environment
call venv\Scripts\activate.bat

REM Install npm packages
call npm install

REM Install Python packages
call pip install -r requirements.txt

REM Start the npm server in a new process so it doesn't hold up the rest of the script
start cmd /k "npm start"

REM Wait an additional 5 seconds to ensure the server is up before opening the browser
timeout /t 10

REM Open the default web browser to the specified URL
start http://localhost:3000
