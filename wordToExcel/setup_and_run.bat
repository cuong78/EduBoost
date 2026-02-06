@echo off
cd /d "%~dp0"

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo Running Word to Excel converter...
python word_to_excel.py

echo Done!
pause
