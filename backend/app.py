from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os, shutil, urllib.parse, json
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


# ------------------------
#   HÀM LƯU / ĐỌC META.JSON
# ------------------------

def load_meta(user_folder):
    meta_path = os.path.join(user_folder, "meta.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            return json.load(f)
    return {}

def save_meta(user_folder, meta):
    meta_path = os.path.join(user_folder, "meta.json")
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)


# ------------------------
#      SEARCH
# ------------------------

@app.get("/search")
async def search_files(query: str = Query("*")):
    results = []

    for encoded_email in os.listdir(BASE_DIR):
        user_path = os.path.join(BASE_DIR, encoded_email)
        if not os.path.isdir(user_path):
            continue

        user_email = urllib.parse.unquote(encoded_email)

        # 🔥 Load meta.json cho từng user
        meta_path = os.path.join(user_path, "meta.json")
        if os.path.exists(meta_path):
            with open(meta_path, "r") as f:
                meta = json.load(f)
        else:
            meta = {}

        for file in os.listdir(user_path):
            if file == "meta.json":
                continue

            if query == "*" or query.lower() in file.lower():
                results.append({
                    "user_email": user_email,
                    "filename": file,
                    "title": os.path.splitext(file)[0],
                    "label": meta.get(file, {}).get("label", None),  # 👈 LABEL ĐÃ CÓ 100%
                    "download_url": f"http://127.0.0.1:8000/download/{urllib.parse.quote(file)}?user_email={urllib.parse.quote(user_email)}"
                })

    return {"results": results}



# ------------------------
#      UPLOAD
# ------------------------

@app.post("/upload")
async def upload_files(
    user_email: str = Form(...),
    files: List[UploadFile] = File(...),
    titles: List[str] = Form(...),
    labels: List[str] = Form(...),
):
    encoded_email = urllib.parse.quote(user_email, safe="")
    user_folder = os.path.join(BASE_DIR, encoded_email)
    os.makedirs(user_folder, exist_ok=True)

    meta = load_meta(user_folder)

    saved_files = []
    for file, title, label in zip(files, titles, labels):
        filename = f"{title.strip()}{os.path.splitext(file.filename)[1]}"
        file_path = os.path.join(user_folder, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # lưu label vào meta.json
        meta[filename] = {"label": label}

        saved_files.append({
            "name": filename,
            "title": title,
            "label": label
        })

    # update meta.json
    save_meta(user_folder, meta)

    return {"message": "Upload thành công!", "files": saved_files}


# ------------------------
#        RENAME
# ------------------------

@app.put("/upload")
async def rename_file(
    user_email: str = Form(...),
    old_name: str = Form(...),
    new_name: str = Form(...),
):
    encoded_email = urllib.parse.quote(user_email, safe="")
    user_folder = os.path.join(BASE_DIR, encoded_email)

    old_path = os.path.join(user_folder, old_name)

    ext = os.path.splitext(old_name)[1]
    new_filename = f"{new_name}{ext}"
    new_path = os.path.join(user_folder, new_filename)

    if not os.path.exists(old_path):
        raise HTTPException(status_code=404, detail="File không tồn tại!")

    if os.path.exists(new_path):
        raise HTTPException(status_code=400, detail="Tên file mới đã tồn tại!")

    # rename file
    os.rename(old_path, new_path)

    # update meta.json
    meta = load_meta(user_folder)
    if old_name in meta:
        meta[new_filename] = meta.pop(old_name)
        save_meta(user_folder, meta)

    return {"message": "Đã đổi tên thành công!"}


# ------------------------
#        LIST FILES
# ------------------------

@app.get("/files")
async def list_files(user_email: str):
    encoded_email = urllib.parse.quote(user_email, safe="")
    user_folder = os.path.join(BASE_DIR, encoded_email)

    if not os.path.exists(user_folder):
        return {"files": []}

    meta = load_meta(user_folder)

    files = []
    for f in os.listdir(user_folder):
        if f == "meta.json":
            continue
        files.append({
            "name": f,
            "title": os.path.splitext(f)[0],
            "label": meta.get(f, {}).get("label", None)
        })

    return {"files": files}


# ------------------------
#      DOWNLOAD
# ------------------------

@app.get("/download/{filename}")
async def download_file(filename: str, user_email: str):
    encoded_email = urllib.parse.quote(user_email, safe="")
    file_path = os.path.join(BASE_DIR, encoded_email, filename)

    if not os.path.exists(file_path):
        return {"error": "File không tồn tại!"}

    return FileResponse(file_path, filename=filename)


# ------------------------
#        DELETE
# ------------------------

@app.delete("/delete/{filename}")
async def delete_file(filename: str, user_email: str):
    encoded_email = urllib.parse.quote(user_email, safe="")
    user_folder = os.path.join(BASE_DIR, encoded_email)
    file_path = os.path.join(user_folder, filename)

    if not os.path.exists(file_path):
        return {"error": "File không tồn tại!"}

    os.remove(file_path)

    # xóa luôn label trong meta.json
    meta = load_meta(user_folder)
    if filename in meta:
        del meta[filename]
        save_meta(user_folder, meta)

    return {"message": f"Đã xóa file '{filename}' thành công!"}
