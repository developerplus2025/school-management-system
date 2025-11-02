from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os, shutil
from typing import List

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = "uploads"
os.makedirs(BASE_DIR, exist_ok=True)

@app.post("/upload")
async def upload_files(
    user_id: str = Form(...),
    files: List[UploadFile] = File(...),
    titles: List[str] = Form(...),
):
    user_folder = os.path.join(BASE_DIR, user_id)
    os.makedirs(user_folder, exist_ok=True)

    saved_files = []
    for file, title in zip(files, titles):
        filename = f"{title}_{file.filename}"
        file_path = os.path.join(user_folder, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_files.append({"name": filename, "title": title})

    return {"message": f"Tải lên {len(files)} file thành công!", "files": saved_files}

@app.get("/files")
async def list_files(user_id: str):
    user_folder = os.path.join(BASE_DIR, user_id)
    if not os.path.exists(user_folder):
        return {"files": []}
    files = [{"name": f, "title": f.split("_")[0]} for f in os.listdir(user_folder)]
    return {"files": files}

@app.get("/download/{filename}")
async def download_file(filename: str, user_id: str):
    file_path = os.path.join(BASE_DIR, user_id, filename)
    if not os.path.exists(file_path):
        return {"error": "File không tồn tại!"}
    return FileResponse(file_path, filename=filename)

@app.delete("/delete/{filename}")
async def delete_file(filename: str, user_id: str):
    file_path = os.path.join(BASE_DIR, user_id, filename)
    if not os.path.exists(file_path):
        return {"error": "File không tồn tại!"}
    os.remove(file_path)
    return {"message": f"Đã xóa file '{filename}' thành công!"}
