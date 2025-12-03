import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "../lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React from "react";

export type FileData = {
  name: string;
  title?: string;
  lable: string;
  date: string;
  file_class: number;
};

type FileActionsProps = {
  data: FileData;
};

export default function FileActions({ data }: FileActionsProps) {
  const { data: session } = useSession();
  const token = session?.session?.token;
  const userEmail = session?.user?.email;

  const [renameOpen, setRenameOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");

  const handleDeleteFile = async () => {
    const filename = data.name;

    if (!token || !userEmail) {
      toast.warning("Vui lòng đăng nhập để xóa file.");
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

      const result = await res.json();

      if (res.ok) {
        toast.success(result.message);
         setTimeout(() => {
           window.location.reload();
         }, 1000);
      } else {
        toast.error(result.error || "Không thể xóa file.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể kết nối đến server!");
    }
  };

 const handleRenameFile = async () => {
   const oldName = data.name;

   if (!token || !userEmail) {
     toast.warning("Vui lòng đăng nhập để đổi tên file.");
     return;
   }

   if (!newName.trim()) {
     toast.error("Tên mới không được để trống!");
     return;
   }

   const formData = new FormData();
   formData.append("user_email", userEmail);
   formData.append("old_name", oldName);
   formData.append("new_name", newName.trim());

   try {
     const res = await fetch("http://127.0.0.1:8000/rename", {
       method: "PUT",
       headers: { Authorization: `Bearer ${token}` },
       body: formData,
     });

     const result = await res.json();

     if (res.ok) {
       toast.success(result.message);
       setRenameOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);

     } else {
       toast.error(result.detail || "Lỗi khi đổi tên file.");
     }
   } catch (err) {
     console.error(err);
     toast.error("Không thể kết nối đến server!");
   }
 };


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setRenameOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename file
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDeleteFile} >
            <Trash className="mr-2 h-4 w-4" />
            Delete file
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* RENAME DIALOG */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="New file name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <DialogFooter>
            <Button variant={'outline'} size={'sm'} onClick={handleRenameFile}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
