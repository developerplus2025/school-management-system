"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UploadIcon,
  XIcon,
  CheckCircleIcon,
  Terminal,
  TriangleAlert,
} from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useFileUpload, formatBytes } from "@/hooks/use-file-upload";
import { useSession } from "../lib/auth-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function UploadToServer() {
  const { data: session } = useSession();
  const token = session?.session?.token;
  const userId = session?.user?.id;

  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [serverFiles, setServerFiles] = useState<
    { name: string; title?: string }[]
  >([]);

  const [
    { files },
    { handleDrop, openFileDialog, removeFile, clearFiles, getInputProps },
  ] = useFileUpload({ multiple: true, maxSize: 5 * 1024 * 1024, maxFiles: 30 });

  const fetchServerFiles = async () => {
    if (!userId || !token) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/files?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setServerFiles(data.files || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách file:", err);
    }
  };

  useEffect(() => {
    fetchServerFiles();
  }, [userId]);

  const handleUploadToServer = async () => {
    if (!token || !userId) {
      setStatus(" Please login before uploading files.");
      return;
    }

    if (files.length === 0) {
      setStatus("Vui lòng chọn file trước khi tải lên.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    files.forEach((f) => {
      if (f.file instanceof File) {
        formData.append("files", f.file);
        formData.append("titles", f.title || f.file.name);
      }
    });

    try {
      setUploading(true);
      setStatus("Đang tải lên...");

      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setStatus(data.message);
        clearFiles();
        fetchServerFiles();
      } else {
        setStatus(data.error || "Lỗi khi tải file.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Không thể kết nối đến server!");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (filename: string) => {
    if (!token || !userId) {
      setStatus("⚠️ Vui lòng đăng nhập để xóa file.");
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa "${filename}" không?`)) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/delete/${encodeURIComponent(
          filename
        )}?user_id=${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setStatus(data.message);
        fetchServerFiles();
      } else {
        setStatus(data.error || "Không thể xóa file.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Không thể kết nối đến server!");
    }
  };

  return (
    <div className="flex mt-[90px] flex-col w-[600px] gap-6">
      {!token ? (
        <div className="mt-[5rem]">
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>
              You need to log in to upload and manage your files.
            </AlertTitle>
            <AlertDescription>
              You can read docs before use service
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <>
          <div
            onDrop={handleDrop}
            className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors"
          >
            <input multiple {...getInputProps()} className="sr-only" />
            <div className="text-center">
              <UploadIcon className="mb-2 size-8 opacity-60 mx-auto" />
              <p className="text-sm font-medium">
                Drag and drop or select files
              </p>
              <p className="text-xs text-muted-foreground">
                (Maximum 5MB, 30 files)
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={openFileDialog}
              >
                Choose file
              </Button>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Image
                      src={String(file.preview)}
                      alt={file.file.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="truncate text-[13px] font-medium">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(file.file.size)}
                      </p>
                    </div>
                  </div>
                  <Input
                    type="text"
                    placeholder="Nhập tiêu đề..."
                    className="border rounded px-2 py-1 text-sm w-48"
                    onChange={(e) => (file.title = e.target.value)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFile(file.id)}
                  >
                    <XIcon />
                  </Button>
                </div>
              ))}

              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  onClick={handleUploadToServer}
                  disabled={uploading}
                >
                  {uploading ? "Đang tải lên..." : "Upload"}
                </Button>
                <Button size="sm" variant="outline" onClick={clearFiles}>
                  Xóa tất cả
                </Button>
              </div>
            </div>
          )}

          <ScrollArea className="h-[300px] overflow-y-auto">
            <ul className="space-y-2">
              {serverFiles.map((file) => {
                const fileUrl = `http://127.0.0.1:8000/download/${encodeURIComponent(
                  file.name
                )}?user_id=${userId}`;
                const isImage = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(
                  file.name
                );

                return (
                  <li
                    key={file.name}
                    className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      {isImage && (
                        <img
                          src={fileUrl}
                          alt={file.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      )}
                      <span className="truncate">
                        {file.title || file.name}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(fileUrl, "_blank")}
                      >
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteFile(file.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </>
      )}

      {status && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <CheckCircleIcon className="size-3 shrink-0" />
          <span>{status}</span>
        </div>
      )}
    </div>
  );
}
