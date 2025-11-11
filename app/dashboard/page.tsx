"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UploadIcon,
  XIcon,
  TriangleAlert,
  Trash,
  Download,
  Edit,
} from "lucide-react";
import Image from "next/image";
import { useFileUpload, formatBytes } from "@/hooks/use-file-upload";
import { useSession } from "../lib/auth-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export default function UploadToServer() {
  const { data: session } = useSession();
  const token = session?.session?.token;
  const userEmail = session?.user?.email;
  const [edit, setEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [serverFiles, setServerFiles] = useState<
    { name: string; title?: string }[]
  >([]);

  const [
    { files },
    { handleDrop, openFileDialog, removeFile, clearFiles, getInputProps },
  ] = useFileUpload({ multiple: true, maxSize: 5 * 1024 * 1024, maxFiles: 30 });

  // Lấy danh sách file từ server
  const fetchServerFiles = async () => {
    if (!userEmail || !token) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/files?user_email=${encodeURIComponent(
          userEmail
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) setServerFiles(data.files || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách file:", err);
    }
  };

  useEffect(() => {
    fetchServerFiles();
  }, [userEmail]);

  // Upload file với tên đồng bộ từ input
  const handleUploadToServer = async () => {
    if (!token || !userEmail) {
      setStatus("Please login before uploading files.");
      return;
    }

    if (files.length === 0) {
      setStatus("Vui lòng chọn file trước khi tải lên.");
      return;
    }

    const formData = new FormData();
    formData.append("user_email", userEmail);

    files.forEach((f) => {
      if (f.file instanceof File) {
        formData.append("files", f.file);
        // Dùng tên nhập từ input làm tên file gửi lên server
        const customName = f.title?.trim() || f.file.name;
        formData.append("titles", customName);
      }
    });

    try {
      setUploading(true);
      setStatus("Đang tải lên...");

      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast(data.message);
        setStatus(data.message);
        clearFiles();
        fetchServerFiles();
      } else {
        console.error(data);
        setStatus(data.error || "Lỗi khi tải file.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Không thể kết nối đến server!");
    } finally {
      setUploading(false);
    }
  };

  // Xóa file
  const handleDeleteFile = async (filename: string) => {
    if (!token || !userEmail) {
      setStatus("⚠️ Vui lòng đăng nhập để xóa file.");
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa "${filename}" không?`)) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/delete/${encodeURIComponent(
          filename
        )}?user_email=${userEmail}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast(data.message);
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
    <div className="flex mt-[90px] flex-col w-[800px] gap-6">
      {!token ? (
        <div className="mt-[5rem]">
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Bạn cần đăng nhập để tải file.</AlertTitle>
            <AlertDescription>
              Hãy đăng nhập để sử dụng chức năng upload và quản lý file.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <>
          {/* Khu vực chọn file */}
          <div
            onDrop={handleDrop}
            className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors"
          >
            <input multiple {...getInputProps()} className="sr-only" />
            <div className="text-center">
              <UploadIcon className="mb-2 size-8 opacity-60 mx-auto" />
              <p className="text-sm font-medium">
                Kéo thả hoặc chọn file để tải lên
              </p>
              <p className="text-xs text-muted-foreground">
                (Tối đa 5MB mỗi file, tối đa 30 file)
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={openFileDialog}
              >
                Chọn file
              </Button>
            </div>
          </div>

          {/* Danh sách file chuẩn bị upload */}
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

                  {/* Nhập tên file tùy chỉnh */}
                  <Input
                    type="text"
                    placeholder="Nhập tên file..."
                    defaultValue={file.file.name}
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

          {/* Danh sách file đã có trên server */}
          <ScrollArea className="h-[340px] px-4">
            <ul className="space-y-2">
              {serverFiles.map((file) => {
                const fileUrl = `http://127.0.0.1:8000/download/${encodeURIComponent(
                  file.name
                )}?user_email=${userEmail}`;
                const isImage = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(
                  file.name
                );

                return (
                  <li
                    key={file.name}
                    className="flex items-center justify-between border-input border rounded-md px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      {isImage && (
                        <img
                          src={fileUrl}
                          alt={file.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      )}
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(fileUrl, "_blank")}
                      >
                        <Download />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteFile(file.name)}
                      >
                        <Trash />
                        Delete
                      </Button>
                      {}
                      <Button
                        variant={"outline"}
                        size={"icon-sm"}
                        onClick={() => setEdit(!edit)}
                      >
                        <Edit />
                      </Button>
                      {edit && (
                        <div className="flex gap-4 items-center">
                          <Button
                            className="pr-0! justify-between  pl-2"
                            variant={"outline"}
                          >
                            <Input
                              type="text"
                              placeholder="Nhập tên file..."
                              defaultValue={file.name}
                              className="border rounded px-2 py-1 text-sm w-full"
                              onChange={(e) => (file.title = e.target.value)}
                            />
                          </Button>
                          <Button
                            variant={"outline"}
                            size={"sm"}
                            onClick={handleUploadToServer}
                          >
                            Change
                          </Button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
