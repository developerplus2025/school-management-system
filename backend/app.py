from fastapi import FastAPI, UploadFile, File, Form, Query
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


@app.get("/search")
async def search_files(query: str = Query("*")):
    results = []

    for user_folder in os.listdir(BASE_DIR):
        user_path = os.path.join(BASE_DIR, user_folder)
        if not os.path.isdir(user_path):
            continue

        for file in os.listdir(user_path):
            if query == "*" or query.lower() in file.lower():
                results.append({
                    "user_id": user_folder,
                    "filename": file,
                    "title": file.split("_")[0] if "_" in file else file,
                    "download_url": f"http://127.0.0.1:8000/download/{file}?user_id={user_folder}"
                })

    return {"results": results}



# 📤 API tải file lên
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
        safe_title = title.strip().replace(" ", "_")
        filename = f"{safe_title}_{file.filename}"
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

    files = [
        {"name": f, "title": f.split("_")[0] if "_" in f else f}
        for f in os.listdir(user_folder)
    ]
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
