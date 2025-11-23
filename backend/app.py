from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException
from fastapi.responses import FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
import os, shutil, urllib.parse, json
from typing import List

app = FastAPI()

# ------------------------
#      CORS
# ------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
#      THƯ MỤC LƯU FILE
# ------------------------
BASE_DIR = "public/uploads"
os.makedirs(BASE_DIR, exist_ok=True)

def encode_email(email: str) -> str:
    return email.replace("@", "-").replace(".", "")

# ------------------------
#   HÀM LƯU / ĐỌC META.JSON
# ------------------------
def load_meta(user_folder: str) -> dict:
    meta_path = os.path.join(user_folder, "meta.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            return json.load(f)
    return {}

def save_meta(user_folder: str, meta: dict):
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
        meta = load_meta(user_path)

        for file in os.listdir(user_path):
            if file == "meta.json":
                continue

            if query == "*" or query.lower() in file.lower():
                file_meta = meta.get(file, {})
                results.append({
                    "user_email": user_email,
                    "filename": file,
                    "title": os.path.splitext(file)[0],
                    "label": file_meta.get("label"),
                    "date": file_meta.get("date"),
                    "file_class": file_meta.get("file_class"),
                    "download_url": f"http://127.0.0.1:8000/download/{urllib.parse.quote(file)}?user_email={urllib.parse.quote(user_email)}"
                })

    return {"results": results}

# ------------------------
#      UPLOAD FILES
# ------------------------
@app.post("/upload")
async def upload_files(
    user_email: str = Form(...),
    files: List[UploadFile] = File(...),
    titles: List[str] = Form(...),
    labels: List[str] = Form(...),
    date: List[str] = Form(...),
    file_class: List[str] = Form(...)
):
    encoded_email = encode_email(user_email)
    user_folder = os.path.join(BASE_DIR, encoded_email)
    os.makedirs(user_folder, exist_ok=True)

    meta = load_meta(user_folder)
    saved_files = []

    for file, title, label, date_value, cls in zip(files, titles, labels, date, file_class):
        filename = f"{title.strip()}{os.path.splitext(file.filename)[1]}"
        file_path = os.path.join(user_folder, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        meta[filename] = {"label": label, "date": date_value, "file_class": cls}

        saved_files.append({
            "name": filename,
            "title": title,
            "label": label,
            "date": date_value,
            "file_class": cls,
            "public_url": f"/uploads/{encoded_email}/{filename}"
        })

    save_meta(user_folder, meta)
    return {"message": "Upload thành công!", "files": saved_files}

# ------------------------
#      LIST FILES
# ------------------------
@app.get("/files")
async def list_files(user_email: str):
    encoded_email = encode_email(user_email)
    user_folder = os.path.join(BASE_DIR, encoded_email)

    if not os.path.exists(user_folder):
        return {"files": []}

    meta = load_meta(user_folder)
    files = []

    for f in os.listdir(user_folder):
        if f == "meta.json":
            continue
        file_meta = meta.get(f, {})
        files.append({
            "name": f,
            "title": os.path.splitext(f)[0],
            "label": file_meta.get("label"),
            "class": file_meta.get("label"),
            "date": file_meta.get("date"),
            "file_class": file_meta.get("file_class")
        })

    return {"files": files}

# ------------------------
#      DOWNLOAD FILE
# ------------------------
@app.head("/download/{filename}")
async def head_file(filename: str, user_email: str):
    encoded_email = encode_email(user_email)
    file_path = os.path.join(BASE_DIR, encoded_email, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File không tồn tại!")

    return Response(status_code=200, headers={"Content-Type": "application/pdf"})

@app.get("/download/{filename}")
async def download_file(filename: str, user_email: str):
    encoded_email = encode_email(user_email)
    file_path = os.path.join(BASE_DIR, encoded_email, filename)
    if not os.path.exists(file_path):
        raise HTTPException(404, "File không tồn tại")

    return FileResponse(file_path, media_type="application/pdf", filename=filename)
# ------------------------
#      RENAME FILE
# ------------------------
@app.put("/rename")
async def rename_file(
    user_email: str = Form(...),
    old_name: str = Form(...),
    new_name: str = Form(...)
):
    encoded_email = encode_email(user_email)
    user_folder = os.path.join(BASE_DIR, encoded_email)
    old_file_path = os.path.join(user_folder, old_name)

    if not os.path.exists(old_file_path):
        raise HTTPException(status_code=404, detail="File cũ không tồn tại!")

    new_file_path = os.path.join(user_folder, new_name + os.path.splitext(old_name)[1])

    if os.path.exists(new_file_path):
        raise HTTPException(status_code=400, detail="File mới đã tồn tại!")

    # Đổi tên file
    os.rename(old_file_path, new_file_path)

    # Cập nhật meta.json
    meta = load_meta(user_folder)
    if old_name in meta:
        meta[new_name + os.path.splitext(old_name)[1]] = meta.pop(old_name)
        save_meta(user_folder, meta)

    return {
        "message": f"Đổi tên file '{old_name}' thành '{new_name + os.path.splitext(old_name)[1]}' thành công!"
    }

# ------------------------
#      DELETE FILE
# ------------------------
@app.delete("/delete/{filename}")
async def delete_file(filename: str, user_email: str):
    encoded_email = encode_email(user_email)
    user_folder = os.path.join(BASE_DIR, encoded_email)
    file_path = os.path.join(user_folder, filename)

    if not os.path.exists(file_path):
        return {"error": "File không tồn tại!"}

    os.remove(file_path)

    meta = load_meta(user_folder)
    if filename in meta:
        del meta[filename]
        save_meta(user_folder, meta)

    return {"message": f"Đã xóa file '{filename}' thành công!"}
