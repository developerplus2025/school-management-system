import subprocess

subprocess.Popen(["cmd", "/k", "uvicorn backend.app:app --reload --port 8000"])

subprocess.Popen("cmd /k \"npm install && npm run dev\"", shell=True)
