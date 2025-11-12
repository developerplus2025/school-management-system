from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os, shutil, urllib.parse
from typing import List

app = FastAPI()

# Cho phép CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thư mục gốc lưu file
BASE_DIR = "uploads"
os.makedirs(BASE_DIR, exist_ok=True)


# 🔍 API tìm kiếm toàn bộ file của tất cả người dùng
@app.get("/search")
async def search_files(query: str = Query("*")):
    results = []

    for encoded_email in os.listdir(BASE_DIR):
        user_path = os.path.join(BASE_DIR, encoded_email)
        if not os.path.isdir(user_path):
            continue

        user_email = urllib.parse.unquote(encoded_email)

        for file in os.listdir(user_path):
            if query == "*" or query.lower() in file.lower():
                results.append({
                    "user_email": user_email,
                    "filename": file,
                    "title": os.path.splitext(file)[0],
                    "download_url": f"http://127.0.0.1:8000/download/{urllib.parse.quote(file)}?user_email={urllib.parse.quote(user_email)}"
                })

    return {"results": results}


# 📤 API tải file lên
@app.post("/upload")
async def upload_files(
    user_email: str = Form(...),
    files: List[UploadFile] = File(...),
    titles: List[str] = Form(...),
):
    encoded_email = urllib.parse.quote(user_email, safe="")
    user_folder = os.path.join(BASE_DIR, encoded_email)
    os.makedirs(user_folder, exist_ok=True)

    saved_files = []
    for file, title in zip(files, titles):
        filename = f"{title.strip()}{os.path.splitext(file.filename)[1]}"
        file_path = os.path.join(user_folder, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        saved_files.append({"name": filename, "title": title})

    return {"message": f"Tải lên {len(saved_files)} file thành công!", "files": saved_files}


# ✏️ Đổi tên file (sử dụng PUT /upload)
@app.put("/upload")
async def rename_file(
    user_email: str = Form(...),
    old_name: str = Form(...),
    new_name: str = Form(...),
):
    encoded_email = urllib.parse.quote(user_email, safe="")
    user_folder = os.path.join(BASE_DIR, encoded_email)

    old_path = os.path.join(user_folder, old_name)
    ext = os.path.splitext(old_name)[1]  # Giữ lại phần mở rộng cũ
    new_path = os.path.join(user_folder, f"{new_name}{ext}")

    if not os.path.exists(old_path):
        raise HTTPException(status_code=404, detail="File không tồn tại!")

    if os.path.exists(new_path):
        raise HTTPException(status_code=400, detail="Tên file mới đã tồn tại!")

    os.rename(old_path, new_path)
    return {"message": f"Đã đổi tên '{old_name}' thành '{new_name}{ext}' thành công!"}


# 📄 Danh sách file của 1 người dùng
@app.get("/files")
async def list_files(user_email: str):
    encoded_email = urllib.parse.quote(user_email, safe="")
    user_folder = os.path.join(BASE_DIR, encoded_email)
    if not os.path.exists(user_folder):
        return {"files": []}

    files = [
        {"name": f, "title": os.path.splitext(f)[0]}
        for f in os.listdir(user_folder)
    ]
    return {"files": files}


# ⬇️ Tải file
@app.get("/download/{filename}")
async def download_file(filename: str, user_email: str):
    encoded_email = urllib.parse.quote(user_email, safe="")
    file_path = os.path.join(BASE_DIR, encoded_email, filename)

    if not os.path.exists(file_path):
        return {"error": "File không tồn tại!"}

    return FileResponse(file_path, filename=filename)


# ❌ Xóa file
@app.delete("/delete/{filename}")
async def delete_file(filename: str, user_email: str):
    encoded_email = urllib.parse.quote(user_email, safe="")
    file_path = os.path.join(BASE_DIR, encoded_email, filename)

    if not os.path.exists(file_path):
        return {"error": "File không tồn tại!"}

    os.remove(file_path)
    return {"message": f"Đã xóa file '{filename}' thành công!"}
