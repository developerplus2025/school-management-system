import subprocess
subprocess.Popen([
    "osascript",
    "-e",
    'tell application "Terminal" to do script "uvicorn backend.app:app --reload --port 8000"'
])
subprocess.Popen([
    "osascript",
    "-e",
    'tell application "Terminal" to do script "npm install && npm run dev"'
])
