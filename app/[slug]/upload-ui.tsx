"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UploadIcon,
  XIcon,
  TriangleAlert,
  Trash,
  Download,
  Edit,
  View,
  FolderPen,
  User,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import Image from "next/image";
import { useFileUpload, formatBytes } from "@/hooks/use-file-upload";
import { authClient, useSession } from "../lib/auth-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FileActions from "./FileActions";
const labels = [
  { value: "math", label: "Math" },
  { value: "physics", label: "Physics" },
  { value: "computer-science", label: "Computer Science" },
  { value: "chemistry", label: "Chemistry" },
  { value: "english", label: "English" },
  { value: "history", label: "History" },
];
export type TypeData = {
  name: string;
  title?: string;
  lable: string;
  date: string;
  file_class: number;
  type_file: string;
  file_size: string;
};
export const columns: ColumnDef<TypeData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div className="capitalize">{row.getValue("date")}</div>,
  },

  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          File Name
          <ArrowUpDown />
        </Button>
      );
    },

    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "file_class",
    header: "File Class",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("file_class")}</div>
    ),
  },
  {
    accessorKey: "file_size",
    header: "File Size",
    cell: ({ row }) => (
      <div className="capitalize text-sm">
        {formatBytes(row.getValue("file_size"))}
      </div>
    ),
  },
  {
    accessorKey: "type_file",
    header: "File Type",
    cell: ({ row }) => (
      <div className="capitalize text-sm">{row.getValue("type_file")}</div>
    ),
  },
  {
    accessorKey: "label",
    header: "Subject",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("label")}</div>
    ),
  },
  {
    id: "delete",
    enableHiding: false,
    cell: ({ row }) => {
      const data = row.original;

      return <FileActions data={data} />;
    },
  },
];
export default function UploadToServer() {
  const { data: session } = useSession();
  const token = session?.session?.token;
  const [login, setLogin] = useState(token ? true : false);
  const userEmail = session?.user?.email;
  const [customName, setCustomName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [serverFiles, setServerFiles] = useState<
    {
      name: string;
      title?: string;
      lable: string;
      date: string;
      file_class: number;
      type_file: string;
      file_size: string;
    }[]
  >([]);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  // 🔧 State đổi tên file
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const [
    { files },
    {
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
      setFileLabel,
      setFileClass,
    },
  ] = useFileUpload({
    multiple: true,
    maxSize: 5 * 1024 * 1024 * 1024,
    maxFiles: 30,
  });

  // 🧩 Lấy danh sách file từ server
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
      console.log(data);
      if (res.ok) setServerFiles(data.files || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách file:", err);
    }
  };

  useEffect(() => {
    fetchServerFiles();
  }, [userEmail]);

  // 📤 Upload file
  const handleUploadToServer = async () => {
    if (!token || !userEmail) {
      setStatus("Vui lòng đăng nhập trước khi tải lên.");
      return;
    }
    const filesWithoutLabel = files.filter((f) => !f.label);
    if (filesWithoutLabel.length > 0) {
      toast.warning("Vui lòng chọn label cho tất cả file trước khi upload.");
      return;
    }
    if (files.length === 0) {
      setStatus("Vui lòng chọn file trước khi tải lên.");
      return;
    }
    const now = new Date();

    const datePart = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    });

    const timePart = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const final = `${datePart} at ${timePart}`;
    console.log(final);

    const formData = new FormData();
    formData.append("user_email", userEmail);

    files.forEach((f) => {
      if (f.file instanceof File) {
        formData.append("files", f.file);

        const newName = f.title?.trim() || f.file.name;
        formData.append("titles", newName);

        formData.append("type_file", f.file.type || "unknown"); // <-- bắt buộc
        formData.append("file_size", String(f.file.size || 0)); // <-- bắt buộc

        formData.append("labels", f.label || final);
        formData.append("date", (f.date = final));
        formData.append("file_class", f.fileClass || "None");
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
        toast.success(data.message);
        clearFiles();
        fetchServerFiles();
      } else {
        toast.error(data.error || "Lỗi khi tải file.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể kết nối đến server!");
    } finally {
      setUploading(false);
    }
  };

  // ❌ Xóa file
  const handleDeleteFile = async (file_name: string) => {
    if (!token || !userEmail) {
      toast.warning("Vui lòng đăng nhập để xóa file.");
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa "${file_name}" không?`)) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/delete/${encodeURIComponent(
          file_name
        )}?user_email=${userEmail}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchServerFiles();
      } else {
        toast.error(data.error || "Không thể xóa file.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể kết nối đến server!");
    }
  };

  // ✏️ Đổi tên file
  const handleRenameFile = async () => {
    if (!token || !userEmail) {
      toast.warning("Vui lòng đăng nhập để đổi tên file.");
      return;
    }

    if (!editingFile || !newName.trim()) {
      toast.error("Tên file không hợp lệ!");
      return;
    }

    const formData = new FormData();
    formData.append("user_email", userEmail);
    formData.append("old_name", editingFile);
    formData.append("new_name", newName.trim());

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setEditingFile(null);
        fetchServerFiles();
      } else {
        toast.error(data.detail || "Lỗi khi đổi tên file.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể kết nối đến server!");
    }
  };
  const [docs, setDocs] = useState<{ uri: string }[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const table = useReactTable<TypeData>({
    data: serverFiles,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });
  useEffect(() => {
    table.setPageSize(8); // đặt pageSize mặc định
  }, [table]);

  return (
    <div className="flex mt-[40px] flex-col w-full px-[3rem]  gap-6">
      {!login ? (
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
          <div
            onDrop={handleDrop}
            className="relative hidden min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors"
          >
            <input multiple {...getInputProps()} className="sr-only" />
            <div className="text-center">
              <UploadIcon className="mb-2 size-8 opacity-60 mx-auto" />
              <p className="text-sm font-medium">
                Drag and drop or select files to upload
              </p>
              <p className="text-xs text-muted-foreground">
                (Max 5MB per file, max 30 files)
              </p>
            </div>
          </div>
          <div className="w-full">
            <div className="flex justify-between items-center py-4">
              <Input
                placeholder="Filter file name..."
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />

              <div className="flex gap-4 items-center">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="">
                      Upload
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[900px]! ">
                    <AlertDialogHeader>
                      <AlertDialogCancel className="self-end border-none! dark:bg-none!">
                        <XIcon></XIcon>
                      </AlertDialogCancel>
                      <AlertDialogTitle className="flex w-full pb-4 justify-center">
                        <Button variant={"outline"} onClick={openFileDialog}>
                          Select file
                        </Button>
                      </AlertDialogTitle>

                      {files.length > 0 && (
                        <div className="space-y-2">
                          <ScrollArea className="h-[400px] flex flex-col gap-4 space-y-2">
                            {files.map((file) => (
                              <div
                                key={file.id}
                                className={cn(
                                  "flex my-4 mx-4 items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3",
                                  !file.label ||
                                    (!file.fileClass && "border-red-500")
                                )}
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  {/* <Image
                                  src={String(file.preview)}
                                  alt={file.file.name}
                                  width={40}
                                  height={40}
                                  className="rounded-md object-cover"
                                /> */}
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                    <p className=" text-[13px] font-medium">
                                      {file.file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatBytes(file.file.size)}
                                    </p>
                                  </div>
                                </div>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-[160px] justify-between"
                                    >
                                      {file.label
                                        ? labels.find(
                                            (l) => l.value === file.label
                                          )?.label
                                        : "Select label"}
                                      <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                  </PopoverTrigger>

                                  <PopoverContent className="w-[160px] p-0">
                                    <Command>
                                      <CommandInput
                                        placeholder="Search label..."
                                        className="h-9"
                                      />
                                      <CommandList>
                                        <CommandEmpty>
                                          No label found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          {labels.map((lb) => (
                                            <CommandItem
                                              defaultValue={"Math"}
                                              key={lb.value}
                                              value={lb.value}
                                              onClick={() => setOpen(false)}
                                              onSelect={(value) => {
                                                setFileLabel(file.id, value);
                                              }}
                                            >
                                              {lb.label}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-[160px] justify-between"
                                    >
                                      {file.fileClass
                                        ? `Class ${file.fileClass}`
                                        : "Select class"}
                                      <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                  </PopoverTrigger>

                                  <PopoverContent className="w-[160px] p-0">
                                    <Command>
                                      <CommandInput
                                        placeholder="Search class..."
                                        className="h-9"
                                      />
                                      <CommandList>
                                        <CommandEmpty>
                                          No class found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          {Array.from(
                                            { length: 12 },
                                            (_, i) => i + 1
                                          ).map((cls) => (
                                            <CommandItem
                                              key={cls}
                                              value={`${cls}`}
                                              onClick={() => setOpen(false)}
                                              onSelect={(value) =>
                                                setFileClass(file.id, value)
                                              }
                                            >
                                              Class {cls}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <Input
                                  type="text"
                                  placeholder="Nhập tên file..."
                                  defaultValue={file.file.name.replace(
                                    /\.[^/.]+$/,
                                    ""
                                  )}
                                  className="border rounded px-2 py-1 text-sm w-fit"
                                  onChange={(e) =>
                                    (file.title = e.target.value)
                                  }
                                />

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    removeFile(file.id);
                                  }}
                                >
                                  <XIcon />
                                </Button>
                              </div>
                            ))}
                          </ScrollArea>

                          <div className="flex items-center pt-4 justify-between">
                            <div className="flex gap-4 items-center">
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                              </AlertDialogFooter>
                              <AlertDialogFooter>
                                {files.some((f) => !f.label || !f.fileClass) ? (
                                  <Button
                                    size={"sm"}
                                    variant={"outline"}
                                    onClick={() =>
                                      toast.warning(
                                        "Please select label and class for all files before uploading."
                                      )
                                    }
                                  >
                                    Upload
                                  </Button>
                                ) : (
                                  <AlertDialogCancel
                                    onClick={handleUploadToServer}
                                    disabled={
                                      files.some(
                                        (f) => !f.label || !f.fileClass
                                      ) || uploading
                                    }
                                  >
                                    {uploading ? "Đang tải lên..." : "Upload"}
                                  </AlertDialogCancel>
                                )}
                              </AlertDialogFooter>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={clearFiles}
                            >
                              Delete All
                            </Button>
                          </div>
                        </div>
                      )}
                    </AlertDialogHeader>
                  </AlertDialogContent>
                </AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Columns <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id.replace("_", " ")}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell className="capitalize" key={cell.id}>
                            {cell.column.id === "label"
                              ? String(cell.getValue()).replace("-", " ")
                              : flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="text-muted-foreground flex-1 text-sm">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
          <ScrollArea className="h-[340px] hidden mb-12 px-4">
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
                    className="flex items-center gap-5 justify-between border-input border rounded-md px-3 py-2"
                  >
                    <div className="flex w-full items-center gap-3">
                      {editingFile === file.name ? (
                        <Input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="border rounded px-2 py-1 text-sm "
                        />
                      ) : (
                        <span className="text-sm">
                          {file.name} {file.file_class}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant={"outline"} size={"sm"}>
                            {" "}
                            <View />
                            View
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[800px]! ">
                          <AlertDialogHeader className="w-full">
                            <AlertDialogTitle className="flex w-full gap-6">
                              {isImage && (
                                <img
                                  src={fileUrl}
                                  alt={file.name}
                                  className="w-[300px] h-[300px] rounded-md object-cover"
                                />
                              )}
                              <div className="flex text-sm justify-center items-center w-full font-normal flex-col gap-1">
                                <div className="flex gap-2 items-center">
                                  <FolderPen className="size-4" />:{" "}
                                  <p className="text-[#a1a1a1]">{file.name}</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <User className="size-4" />:
                                  <p className="text-[#a1a1a1]">
                                    {session?.user.email}
                                  </p>
                                </div>
                              </div>
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {editingFile === file.name ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRenameFile}
                          >
                            Change
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingFile(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
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
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => {
                              setEditingFile(file.name);
                              setNewName(file.title || file.name);
                            }}
                          >
                            <Edit />
                          </Button>
                        </>
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
