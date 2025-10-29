"use client";

import { useEffect, useState } from "react";
import {
  AlertCircleIcon,
  ImageIcon,
  UploadIcon,
  XIcon,
  CheckCircleIcon,
} from "lucide-react";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";

export default function UploadToServer() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024;
  const maxFiles = 6;
  const [serverFiles, setServerFiles] = useState<string[]>([]);

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    maxSize,
    multiple: true,
    maxFiles,
  });

  const fetchServerFiles = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/files");
      const data = await res.json();
      if (res.ok) {
        setServerFiles(data.files);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách file:", error);
    }
  };
  useEffect(() => {
    fetchServerFiles();
  }, []);

  const handleUploadToServer = async () => {
    if (files.length === 0) {
      setStatus(" Chưa có file nào được chọn.");
      return;
    }

    const formData = new FormData();

    files.forEach((f) => {
      if (f.file instanceof File) {
        formData.append("files", f.file);
      }
    });

    try {
      setUploading(true);
      setStatus("Đang tải lên...");

      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(` ${data.message}`);
        clearFiles();
        fetchServerFiles(); // cập nhật danh sách
      } else {
        setStatus(` Lỗi: ${data.error || "Không thể tải lên"}`);
      }
    } catch (error) {
      setStatus(" Kết nối đến server thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${filename}" không?`)) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/delete/${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();

      if (res.ok) {
        setStatus(` ${data.message}`);
        fetchServerFiles(); // Cập nhật lại danh sách sau khi xóa
      } else {
        setStatus(` ${data.error || "Không thể xóa file"}`);
      }
    } catch (error) {
      setStatus(" Kết nối server thất bại!");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Khu vực kéo thả */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        className="relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload files"
        />
        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
          <div
            className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
            aria-hidden="true"
          >
            <ImageIcon className="size-4 opacity-60" />
          </div>
          <p className="mb-1.5 text-sm font-medium">Drop your images here</p>
          <p className="text-xs text-muted-foreground">
            SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
          </p>
          <Button variant="outline" className="mt-4" onClick={openFileDialog}>
            <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
            Select images
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div
          className="flex items-center gap-1 text-xs text-destructive"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="aspect-square shrink-0 rounded bg-accent">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="size-10 rounded-[inherit] object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-[13px] font-medium">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.file.size)}
                  </p>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                onClick={() => removeFile(file.id)}
                aria-label="Remove file"
              >
                <XIcon aria-hidden="true" />
              </Button>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <Button
              size="sm"
              onClick={handleUploadToServer}
              disabled={uploading}
            >
              {uploading ? "Đang tải lên..." : "Upload to Server"}
            </Button>
            {files.length > 1 && (
              <Button size="sm" variant="outline" onClick={clearFiles}>
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>
      )}
      {serverFiles.map((name) => {
        const fileUrl = `http://127.0.0.1:8000/download/${encodeURIComponent(
          name
        )}`;
        const isImage = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(name);

        return (
          <li
            key={name}
            className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {isImage ? (
                <img
                  src={fileUrl}
                  alt={name}
                  className="size-10 rounded-md object-cover border"
                />
              ) : (
                <div className="flex items-center justify-center size-10 rounded-md bg-accent border">
                  <ImageIcon className="size-5 opacity-60" />
                </div>
              )}

              <span className="truncate text-sm font-medium">{name}</span>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(fileUrl, "_blank")}
              >
                Tải xuống
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteFile(name)}
              >
                Xóa
              </Button>
            </div>
          </li>
        );
      })}

      {status && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <CheckCircleIcon className="size-3 shrink-0" />
          <span>{status}</span>
        </div>
      )}
    </div>
  );
}
