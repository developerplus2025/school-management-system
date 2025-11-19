import subprocess

# Terminal 1
subprocess.Popen([
    "gnome-terminal",
    "--", "bash", "-c", "uvicorn backend.app:app --reload --port 8000; exec bash"
])

# Terminal 2
subprocess.Popen([
    "gnome-terminal",
    "--",
    "bash",
    "-c",
    "npm install && npm run dev; exec bash"
])