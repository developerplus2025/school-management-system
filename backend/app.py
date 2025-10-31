from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os, shutil

app = FastAPI()

# Cho phép React frontend gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    titles: List[str] = Form(...)
):
    saved_files = []
    for file, title in zip(files, titles):
        ext = os.path.splitext(file.filename)[1]
        safe_title = title.strip().replace(" ", "-")
        new_filename = f"{safe_title}{ext}"
        file_path = os.path.join(UPLOAD_DIR, new_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        saved_files.append({"filename": new_filename, "title": title})

    return {"message": f"Tải lên {len(files)} file thành công!", "data": saved_files}



@app.get("/files")
async def list_files():
    files = os.listdir(UPLOAD_DIR)
    return {"files": files}


@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        return {"error": "File không tồn tại!"}
    return FileResponse(file_path, filename=filename)



@app.delete("/delete/{filename}")
async def delete_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        return {"error": "File không tồn tại!"}
    os.remove(file_path)
    return {"message": f"Đã xóa file '{filename}' thành công!"}
