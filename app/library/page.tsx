"use client";

import React, { JSX, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "motion/react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  icons,
  ListStart,
  Search,
  Trash,
} from "lucide-react";

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
import { FileIcon } from "react-file-icon";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { Spinner } from "@/components/ui/spinner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
// import PdfViewer from "@/components/file-viewer/file-viewer";
import { Document, Page } from "react-pdf";

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
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatBytes } from "@/hooks/use-file-upload";

export type TypeData = {
  file_name: string;
  user_email: string;
  download_url: string;
  title: string;
  label: string;
  date: string;
  file_class: string;
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
    accessorKey: "user_email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("user_email")}</div>
    ),
  },
  {
    accessorKey: "file_name",

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

    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("file_name")}</div>
    ),
  },
  {
    accessorKey: "file_class",
    header: "Class",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("file_class")}</div>
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
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const data = row.original;
      const currentIndex = row.index;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(data.download_url)}
            >
              Copy download url
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(data.download_url, "_blank")}
            >
              Download
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={`http://localhost:3000/view-file?url=/uploads/${
                  data.user_email
                }/${encodeURIComponent(data.file_name)}`}
                target="_blank" // mở tab mới
                rel="noopener noreferrer"
              >
                View file
              </a>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onClick={() => {
                    [
                      {
                        uri: `./uploads/${data.user_email}/${data.file_name}`,
                      },
                    ];
                  }}
                >
                  View More
                </DropdownMenuItem>
              </AlertDialogTrigger>

              <AlertDialogContent className="max-w-[1480px] overflow-auto h-screen">
                <AlertDialogHeader>
                  <AlertDialogTitle className="hidden"></AlertDialogTitle>
                </AlertDialogHeader>

                <div className="h-full">
                  <img className="rounded-lg" src={data.download_url} alt="" />

                  <DocViewer
                    className="h-[560px]"
                    documents={[
                      {
                        uri: `./uploads/${data.user_email}/${data.file_name}`,
                      },
                    ]}
                    initialActiveDocument={
                      [
                        {
                          uri: `./uploads/${data.user_email}/${data.file_name}`,
                        },
                      ][0]
                    }
                    pluginRenderers={DocViewerRenderers}
                  />
                </div>

                <AlertDialogFooter className="flex w-full xl:justify-between"></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog> */}

            <DropdownMenuItem>View file details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
type FileItem = { file_name: string; download_url: string; user_id?: string };

const data: Record<string, { icon: JSX.Element }> = {
  png: {
    icon: (
      <svg width={40} height={40} fill="none" viewBox="0 0 40 40">
        <mask
          id="png_svg__b"
          width={32}
          height={40}
          x={4}
          y={0}
          maskUnits="userSpaceOnUse"
          style={{
            maskType: "alpha",
          }}
        >
          <path
            fill="url(#png_svg__a)"
            d="M4 4a4 4 0 0 1 4-4h16l12 12v24a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"
          />
        </mask>
        <g mask="url(#png_svg__b)">
          <path
            fill="#F5F5F5"
            d="M4 4a4 4 0 0 1 4-4h16l12 12v24a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"
          />
        </g>
        <path fill="#E9EAEB" d="m24 0 12 12h-8a4 4 0 0 1-4-4z" />
        <path
          fill="#414651"
          d="M10.923 32v-6.546h2.582q.745 0 1.27.285.523.281.798.783.278.498.278 1.15 0 .653-.281 1.151a1.94 1.94 0 0 1-.815.777q-.53.278-1.285.278h-1.646v-1.11h1.422q.4 0 .659-.137a.9.9 0 0 0 .39-.386 1.2 1.2 0 0 0 .13-.572 1.2 1.2 0 0 0-.13-.57.88.88 0 0 0-.39-.38q-.262-.137-.665-.137h-.933V32zm11.302-6.546V32h-1.196l-2.847-4.12h-.048V32H16.75v-6.546h1.215l2.825 4.117h.057v-4.117zm5.483 2.116a1.4 1.4 0 0 0-.188-.412 1.27 1.27 0 0 0-.694-.502 1.7 1.7 0 0 0-.489-.067q-.501 0-.882.25a1.64 1.64 0 0 0-.588.725q-.21.472-.21 1.157 0 .684.207 1.163.207.48.588.732.38.25.898.25.47 0 .802-.167.336-.169.512-.476.179-.306.179-.726l.28.042h-1.687v-1.042h2.74v.825q0 .863-.365 1.483a2.5 2.5 0 0 1-1.003.952q-.64.333-1.464.332-.921 0-1.617-.405a2.8 2.8 0 0 1-1.087-1.16q-.387-.755-.387-1.79 0-.796.23-1.42a3 3 0 0 1 .652-1.06q.42-.434.975-.662.555-.227 1.205-.227.556 0 1.035.163.48.16.85.454.374.295.611.7.237.402.304.888z"
        />
        <defs>
          <linearGradient
            id="png_svg__a"
            x1={20}
            x2={20}
            y1={0}
            y2={40}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopOpacity={0.4} />
            <stop offset={1} />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  docx: {
    icon: (
      <svg width={40} height={40} fill="none" viewBox="0 0 40 40">
        <mask
          id="docx_svg__b"
          width={32}
          height={40}
          x={4}
          y={0}
          maskUnits="userSpaceOnUse"
          style={{
            maskType: "alpha",
          }}
        >
          <path
            fill="url(#docx_svg__a)"
            d="M4 4a4 4 0 0 1 4-4h16l12 12v24a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"
          />
        </mask>
        <g mask="url(#docx_svg__b)">
          <path
            fill="#F5F5F5"
            d="M4 4a4 4 0 0 1 4-4h16l12 12v24a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"
          />
        </g>
        <path fill="#E9EAEB" d="m24 0 12 12h-8a4 4 0 0 1-4-4z" />
        <path
          fill="#414651"
          d="M9.565 32h-2.32v-6.546h2.34q.986 0 1.7.394.712.39 1.096 1.122.386.731.386 1.75 0 1.024-.386 1.759-.383.735-1.103 1.128-.716.393-1.713.393m-.936-1.186h.878q.615 0 1.033-.217.422-.22.633-.68.213-.464.214-1.196 0-.726-.214-1.186a1.4 1.4 0 0 0-.63-.677q-.42-.218-1.032-.218h-.882zm11.178-2.087q0 1.07-.405 1.822-.403.75-1.1 1.147a3.1 3.1 0 0 1-1.56.393 3.1 3.1 0 0 1-1.566-.396 2.8 2.8 0 0 1-1.096-1.147q-.402-.75-.402-1.819 0-1.07.402-1.822.403-.75 1.096-1.144a3.1 3.1 0 0 1 1.566-.396q.867 0 1.56.396.697.393 1.1 1.145.405.75.405 1.821m-1.403 0q0-.693-.207-1.17a1.6 1.6 0 0 0-.579-.722 1.56 1.56 0 0 0-.875-.246q-.502 0-.876.246t-.582.723q-.204.476-.204 1.17 0 .692.204 1.169.208.477.582.722.373.246.875.246t.876-.246.579-.722q.207-.476.207-1.17m8.204-.98h-1.4a1.4 1.4 0 0 0-.157-.483 1.2 1.2 0 0 0-.303-.365 1.3 1.3 0 0 0-.429-.23 1.6 1.6 0 0 0-.52-.08q-.509 0-.886.253-.377.25-.585.728-.207.476-.207 1.157 0 .7.207 1.176.21.477.588.72.378.242.873.242.278 0 .514-.073.24-.074.425-.214.186-.144.307-.349.125-.204.173-.466l1.4.006q-.054.45-.272.87a2.6 2.6 0 0 1-.578.744q-.362.326-.863.518a3.2 3.2 0 0 1-1.128.189 3.1 3.1 0 0 1-1.566-.397 2.8 2.8 0 0 1-1.087-1.147q-.396-.75-.396-1.819 0-1.07.402-1.822.403-.75 1.093-1.144.69-.396 1.553-.396.57 0 1.055.16.49.16.866.466a2.4 2.4 0 0 1 .614.745q.24.44.307 1.01m2.15-2.293 1.32 2.231h.05l1.326-2.23h1.563l-1.997 3.272L33.062 32h-1.591l-1.343-2.234h-.05L28.734 32H27.15l2.048-3.273-2.01-3.273z"
        />
        <defs>
          <linearGradient
            id="docx_svg__a"
            x1={20}
            x2={20}
            y1={0}
            y2={40}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopOpacity={0.4} />
            <stop offset={1} />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  jpg: {
    icon: (
      <svg width={40} height={40} fill="none" viewBox="0 0 40 40">
        <mask
          id="jpg_svg__b"
          width={32}
          height={40}
          x={4}
          y={0}
          maskUnits="userSpaceOnUse"
          style={{
            maskType: "alpha",
          }}
        >
          <path
            fill="url(#jpg_svg__a)"
            d="M4 4a4 4 0 0 1 4-4h16l12 12v24a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"
          />
        </mask>
        <g mask="url(#jpg_svg__b)">
          <path
            fill="#F5F5F5"
            d="M4 4a4 4 0 0 1 4-4h16l12 12v24a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"
          />
        </g>
        <path fill="#E9EAEB" d="m24 0 12 12h-8a4 4 0 0 1-4-4z" />
        <path
          fill="#414651"
          d="M14.286 25.455h1.368v4.564q0 .632-.284 1.099a1.9 1.9 0 0 1-.783.719q-.503.253-1.167.253a2.7 2.7 0 0 1-1.074-.208 1.7 1.7 0 0 1-.76-.64q-.282-.43-.278-1.083h1.377q.007.259.106.444a.7.7 0 0 0 .278.282q.179.095.422.095.255 0 .431-.108a.7.7 0 0 0 .272-.326q.092-.215.092-.527zM16.798 32v-6.546h2.583q.745 0 1.269.285.523.281.799.783.278.498.278 1.15 0 .653-.282 1.151a1.94 1.94 0 0 1-.815.777q-.53.278-1.284.278H17.7v-1.11h1.422q.4 0 .658-.137a.9.9 0 0 0 .39-.386q.13-.25.131-.572 0-.326-.13-.57a.88.88 0 0 0-.39-.38q-.263-.137-.665-.137h-.934V32zm10.168-4.43a1.4 1.4 0 0 0-.189-.412 1.27 1.27 0 0 0-.694-.502 1.7 1.7 0 0 0-.488-.067q-.502 0-.883.25a1.64 1.64 0 0 0-.587.725q-.212.472-.212 1.157 0 .684.208 1.163.209.48.588.732.38.25.898.25.47 0 .803-.167.335-.169.511-.476.18-.306.179-.726l.281.042h-1.687v-1.042h2.739v.825q0 .863-.365 1.483a2.5 2.5 0 0 1-1.003.952q-.639.333-1.464.332-.921 0-1.617-.405a2.8 2.8 0 0 1-1.087-1.16q-.386-.755-.386-1.79 0-.796.23-1.42.232-.625.652-1.06.419-.434.974-.662.557-.227 1.205-.227.556 0 1.036.163.48.16.85.454.375.295.61.7.238.402.304.888z"
        />
        <defs>
          <linearGradient
            id="jpg_svg__a"
            x1={20}
            x2={20}
            y1={0}
            y2={40}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopOpacity={0.4} />
            <stop offset={1} />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  pdf: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={40}
        height={40}
        fill="none"
      >
        <mask
          id="pdf_svg__b"
          width={32}
          height={40}
          x={4}
          y={0}
          maskUnits="userSpaceOnUse"
          style={{
            maskType: "alpha",
          }}
        >
          <path
            fill="url(#pdf_svg__a)"
            d="M4 4a4 4 0 0 1 4-4h16l12 12v24a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"
          />
        </mask>
        <g mask="url(#pdf_svg__b)">
          <path
            fill="#F5F5F5"
            d="M4 4a4 4 0 0 1 4-4h16l12 12v24a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"
          />
        </g>
        <path fill="#E9EAEB" d="m24 0 12 12h-8a4 4 0 0 1-4-4z" />
        <path
          fill="#414651"
          d="M11.75 32v-6.546h2.582q.744 0 1.268.285.524.281.8.783.277.498.277 1.15 0 .653-.28 1.151a1.94 1.94 0 0 1-.816.777q-.53.278-1.285.278H12.65v-1.11h1.423q.399 0 .658-.137a.9.9 0 0 0 .39-.386q.13-.25.13-.572 0-.326-.13-.57a.88.88 0 0 0-.39-.38q-.262-.137-.665-.137h-.933V32zm8.147 0h-2.32v-6.546h2.339q.987 0 1.7.394.712.39 1.096 1.122.387.731.387 1.75 0 1.024-.387 1.759-.384.735-1.102 1.128-.717.393-1.713.393m-.937-1.186h.879q.614 0 1.032-.217.422-.22.633-.68.214-.464.214-1.196 0-.726-.214-1.186a1.4 1.4 0 0 0-.63-.677q-.418-.218-1.032-.218h-.882zM24.124 32v-6.546h4.334v1.142h-2.95v1.56h2.662v1.14h-2.662V32z"
        />
        <defs>
          <linearGradient
            id="pdf_svg__a"
            x1={20}
            x2={20}
            y1={0}
            y2={40}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopOpacity={0.4} />
            <stop offset={1} />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  unknown: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        fill="none"
      >
        <path
          stroke="#D5D7DA"
          strokeWidth="1.5"
          d="M4.75 4A3.25 3.25 0 0 1 8 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 32 39.25H8A3.25 3.25 0 0 1 4.75 36z"
        />
        <path
          stroke="#D5D7DA"
          strokeWidth="1.5"
          d="M24 .5V8a4 4 0 0 0 4 4h7.5"
        />
      </svg>
    ),
  },
};
const subjectFilterData = [
  {
    id: 7,
    value: "all",
    name: "All",
    icons: (
      <svg
        data-testid="geist-icon"
        height={16}
        strokeLinejoin="round"
        viewBox="0 0 16 16"
        width={16}
        style={{
          color: "currentcolor",
        }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.75 2H1V3.5H1.75H14.25H15V2H14.25H1.75ZM1 7H1.75H9.25H10V8.5H9.25H1.75H1V7ZM1 12H1.75H11.25H12V13.5H11.25H1.75H1V12Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 1,
    value: "math",
    name: "Math",
    icons: (
      <svg
        data-testid="geist-icon"
        height={16}
        strokeLinejoin="round"
        viewBox="0 0 16 16"
        width={16}
        style={{
          color: "currentcolor",
        }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.4572 8.75C14.0853 11.9866 11.3362 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.66381 4.01342 1.91465 7.25 1.5428V7.75C7.25 8.30229 7.69772 8.75 8.25 8.75H14.4572ZM14.4572 7.25H8.75V1.5428C11.7405 1.88638 14.1136 4.2595 14.4572 7.25ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 2,
    value: "physics",
    name: "Physics",
    icons: (
      <svg
        data-testid="geist-icon"
        height={16}
        strokeLinejoin="round"
        viewBox="0 0 16 16"
        width={16}
        style={{
          color: "currentcolor",
        }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.67705 15H1L1.75 13.5L6.16147 4.67705L6.15836 4.67082L6.16667 4.66667L7.16147 2.67705L8 1L8.83853 2.67705L14.25 13.5L15 15H13.3229H2.67705ZM7 6.3541L10.5729 13.5H3.42705L7 6.3541Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 3,
    value: "chemistry",
    name: "Chemistry",
    icons: (
      <svg
        data-testid="geist-icon"
        height={16}
        strokeLinejoin="round"
        viewBox="0 0 16 16"
        width={16}
        style={{
          color: "currentcolor",
        }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 7.6736V7V2.5H7V7V7.6736L6.49655 8.12111L4.38279 10L11.6172 10L9.50345 8.12111L9 7.6736ZM5.5 2.5H4V1H5.5H7H9H10.5H12V2.5H10.5V7L14.0735 10.1765C14.6628 10.7003 15 11.4511 15 12.2396C15 13.7641 13.7641 15 12.2396 15H3.7604C2.23587 15 1 13.7641 1 12.2396C1 11.4511 1.33718 10.7003 1.92649 10.1765L5.5 7V2.5ZM2.5 12.2396C2.5 11.9717 2.58527 11.7133 2.7398 11.5L13.2602 11.5C13.4147 11.7133 13.5 11.9717 13.5 12.2396C13.5 12.9357 12.9357 13.5 12.2396 13.5H3.7604C3.0643 13.5 2.5 12.9357 2.5 12.2396Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 4,
    value: "computer-science",
    name: "Computer Science",
    icons: (
      <svg
        data-testid="geist-icon"
        height={16}
        strokeLinejoin="round"
        viewBox="0 0 16 16"
        width={16}
        style={{
          color: "currentcolor",
        }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 2C0 1.44772 0.447715 1 1 1H15C15.5523 1 16 1.44772 16 2V10.5C16 11.0523 15.5523 11.5 15 11.5H8.75V14.5H9.75H10.5V16H9.75H6.25H5.5V14.5H6.25H7.25V11.5H1C0.447714 11.5 0 11.0523 0 10.5V2ZM1.5 2.5V10H14.5V2.5H1.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 5,
    value: "english",
    name: "English",
    icons: (
      <svg
        data-testid="geist-icon"
        height={16}
        strokeLinejoin="round"
        viewBox="0 0 16 16"
        width={16}
        style={{
          color: "currentcolor",
        }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.268 14.0934C11.9051 13.4838 13.2303 12.2333 13.9384 10.6469C13.1192 10.7941 12.2138 10.9111 11.2469 10.9925C11.0336 12.2005 10.695 13.2621 10.268 14.0934ZM8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM8.48347 14.4823C8.32384 14.494 8.16262 14.5 8 14.5C7.83738 14.5 7.67616 14.494 7.51654 14.4823C7.5132 14.4791 7.50984 14.4759 7.50647 14.4726C7.2415 14.2165 6.94578 13.7854 6.67032 13.1558C6.41594 12.5744 6.19979 11.8714 6.04101 11.0778C6.67605 11.1088 7.33104 11.125 8 11.125C8.66896 11.125 9.32395 11.1088 9.95899 11.0778C9.80021 11.8714 9.58406 12.5744 9.32968 13.1558C9.05422 13.7854 8.7585 14.2165 8.49353 14.4726C8.49016 14.4759 8.4868 14.4791 8.48347 14.4823ZM11.4187 9.72246C12.5137 9.62096 13.5116 9.47245 14.3724 9.28806C14.4561 8.87172 14.5 8.44099 14.5 8C14.5 7.55901 14.4561 7.12828 14.3724 6.71194C13.5116 6.52755 12.5137 6.37904 11.4187 6.27753C11.4719 6.83232 11.5 7.40867 11.5 8C11.5 8.59133 11.4719 9.16768 11.4187 9.72246ZM10.1525 6.18401C10.2157 6.75982 10.25 7.36805 10.25 8C10.25 8.63195 10.2157 9.24018 10.1525 9.81598C9.46123 9.85455 8.7409 9.875 8 9.875C7.25909 9.875 6.53877 9.85455 5.84749 9.81598C5.7843 9.24018 5.75 8.63195 5.75 8C5.75 7.36805 5.7843 6.75982 5.84749 6.18401C6.53877 6.14545 7.25909 6.125 8 6.125C8.74091 6.125 9.46123 6.14545 10.1525 6.18401ZM11.2469 5.00748C12.2138 5.08891 13.1191 5.20593 13.9384 5.35306C13.2303 3.7667 11.9051 2.51622 10.268 1.90662C10.695 2.73788 11.0336 3.79953 11.2469 5.00748ZM8.48347 1.51771C8.4868 1.52089 8.49016 1.52411 8.49353 1.52737C8.7585 1.78353 9.05422 2.21456 9.32968 2.84417C9.58406 3.42562 9.80021 4.12856 9.95899 4.92219C9.32395 4.89118 8.66896 4.875 8 4.875C7.33104 4.875 6.67605 4.89118 6.04101 4.92219C6.19978 4.12856 6.41594 3.42562 6.67032 2.84417C6.94578 2.21456 7.2415 1.78353 7.50647 1.52737C7.50984 1.52411 7.51319 1.52089 7.51653 1.51771C7.67615 1.50597 7.83738 1.5 8 1.5C8.16262 1.5 8.32384 1.50597 8.48347 1.51771ZM5.73202 1.90663C4.0949 2.51622 2.76975 3.7667 2.06159 5.35306C2.88085 5.20593 3.78617 5.08891 4.75309 5.00748C4.96639 3.79953 5.30497 2.73788 5.73202 1.90663ZM4.58133 6.27753C3.48633 6.37904 2.48837 6.52755 1.62761 6.71194C1.54392 7.12828 1.5 7.55901 1.5 8C1.5 8.44099 1.54392 8.87172 1.62761 9.28806C2.48837 9.47245 3.48633 9.62096 4.58133 9.72246C4.52807 9.16768 4.5 8.59133 4.5 8C4.5 7.40867 4.52807 6.83232 4.58133 6.27753ZM4.75309 10.9925C3.78617 10.9111 2.88085 10.7941 2.06159 10.6469C2.76975 12.2333 4.0949 13.4838 5.73202 14.0934C5.30497 13.2621 4.96639 12.2005 4.75309 10.9925Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];
const classFilterData = [
  {
    value: "all",
    name: "All",
  },
  { value: "1", name: "Class 1" },
  { value: "2", name: "Class 2" },
  { value: "3", name: "Class 3" },
  { value: "4", name: "Class 4" },
  { value: "5", name: "Class 5" },
  { value: "6", name: "Class 6" },
  { value: "7", name: "Class 7" },
  { value: "8", name: "Class 8" },
  { value: "9", name: "Class 9" },
  { value: "10", name: "Class 10" },
  { value: "11", name: "Class 11" },
  { value: "12", name: "Class 12" },
];

export default function HomeSearchPage() {
  const [query, setQuery] = useState("");
  const [copy, setCopy] = useState(false);
  const [filter, setFilter] = useState({
    subject: [] as string[],
    class: [] as string[],
  });

  const [downloadUrl, setDownloadUrl] = useState("");
  const [open, setOpen] = React.useState(false);
  function copyLink() {
    navigator.clipboard.writeText(downloadUrl);
    toast("Link Copied", {
      action: {
        label: "Close",
        onClick: () => "",
      },
    });

    setTimeout(
      () => {
        setCopy(false);
      },

      1500
    );

    setCopy(true);
  }
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<
    {
      file_name: string;
      user_email: string;
      download_url: string;
      title: string;
      label: string;
      date: string;
      file_class: string;
      type_file: string;
      file_size: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Hàm gọi API tìm kiếm
  const handleSearch = async (searchText: string) => {
    setLoading(true);
    try {
      const url =
        searchText.trim() === ""
          ? "http://127.0.0.1:8000/search/all?query=*"
          : `http://127.0.0.1:8000/search/all?query=${encodeURIComponent(
              searchText
            )}`;

      const res = await fetch(url);
      const data = await res.json();
      console.log("Search All:", data);
      setResults(data.results || []);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm tất cả:", err);
    } finally {
      setIndex(results.length);
      setTimeout(() => setLoading(false), 500);
    }
  };

  // 🔹 Gọi API khi trang load lần đầu (lấy toàn bộ file)
  useEffect(() => {
    handleSearch("");
  }, []);

  // 🔹 Tự động tìm khi người dùng nhập (debounce 500ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(query);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);
  useEffect(() => {
    console.log(filter);
  }, [filter]);

  function toggleFilter(type: "subject" | "class", value: string) {
    setFilter((prev) => {
      const current = prev[type];
      const isSelected = current.includes(value);

      return {
        ...prev,
        [type]: isSelected
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  }

  // Toggle All
  function toggleAll(type: "subject" | "class", allData: { value: string }[]) {
    setFilter((prev) => ({
      ...prev,
      [type]:
        prev[type].length === 0
          ? allData.map((d) => d.value) // All đang bật → tắt All
          : [], // All đang tắt → bật All
    }));
  }

  const filteredResults = useMemo(() => {
    return results
      .slice()
      .reverse()
      .filter((file) => {
        const matchSubject =
          filter.subject.length === 0 || filter.subject.includes(file.label);

        const matchClass =
          filter.class.length === 0 || filter.class.includes(file.file_class);

        return matchSubject && matchClass;
      });
  }, [results, filter]);

  const [docs, setDocs] = useState<{ uri: string }[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const table = useReactTable<TypeData>({
    data: filteredResults,

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
    table.setPageSize(5.7); // đặt pageSize mặc định
  }, [table]);

  return (
    <div className="w-full h-[calc(100vh-100px)] pt-12 px-12 mx-auto  flex flex-col items-center gap-6">
      {/* Thanh tìm kiếm */}

      <ul className="w-full">
        <div className="w-full">
          <div className="flex  gap-4 items-center justify-between py-4">
            <InputGroup>
              <InputGroupInput
                placeholder="Filter file name..."
                value={
                  (table.getColumn("file_name")?.getFilterValue() as string) ??
                  ""
                }
                onChange={(event) =>
                  table
                    .getColumn("file_name")
                    ?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                {results.length} results
              </InputGroupAddon>
            </InputGroup>

            <div className="flex gap-4 items-center">
              <div className="w-full justify-center  gap-6 flex items-center">
                <Button
                  onClick={() => toggleAll("subject", subjectFilterData)}
                  variant="outline"
                  size="sm"
                  className={cn(
                    filter.subject.length === 0
                      ? "text-white"
                      : "text-[#a1a1a1]"
                  )}
                >
                  All Subjects
                </Button>

                {subjectFilterData
                  .filter((d) => d.value !== "all")
                  .map((data) => {
                    const isSelected = filter.subject.includes(data.value);

                    return (
                      <Button
                        key={data.id}
                        disabled={filter.subject.length === 0} // disable khi All
                        className={cn(
                          isSelected ? "text-white" : "text-[#a1a1a1]",
                          filter.subject.length === 0
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                        )}
                        onClick={() => {
                          if (filter.subject.length === 0) return;
                          toggleFilter("subject", data.value);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        {data.icons}
                        {data.name}
                      </Button>
                    );
                  })}
              </div>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className=" "
                  >
                    {/* {filter
                ? subjectFilterData.find((framework) => framework.value === filter)
                    ?.name
                : "All"} */}
                    <svg
                      data-testid="geist-icon"
                      height={16}
                      strokeLinejoin="round"
                      viewBox="0 0 16 16"
                      width={16}
                      style={{
                        color: "currentcolor",
                      }}
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M1 0H1.75H14.25H15V0.75V3V3.31066L14.7803 3.53033L10.5 7.81066V15.25V16H9.75H9H8.7816L8.59734 15.8827L5.84734 14.1327L5.5 13.9117V13.5V7.81066L1.21967 3.53033L1 3.31066V3V0.75V0ZM2.5 1.5V2.68934L6.78033 6.96967L7 7.18934V7.5V13.0883L9 14.361V7.5V7.18934L9.21967 6.96967L13.5 2.68934V1.5H2.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command className="bg-black">
                    <CommandInput
                      placeholder="Search filter..."
                      className="h-9"
                    />
                    <ScrollArea>
                      <CommandList className="bg-black">
                        <CommandEmpty>No subject found.</CommandEmpty>

                        {/* All Subjects */}
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() =>
                              toggleAll("subject", subjectFilterData)
                            }
                          >
                            All Subjects
                            <Check
                              className={cn(
                                "ml-auto",
                                filter.subject.length === 0
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        </CommandGroup>

                        {/* Subject filter */}
                        <CommandGroup heading="Subject">
                          {subjectFilterData
                            .filter((d) => d.value !== "all")
                            .map((data) => (
                              <CommandItem
                                key={data.value}
                                value={data.value}
                                disabled={filter.subject.length === 0} // disable khi All bật
                                onSelect={() => {
                                  if (filter.subject.length === 0) return;
                                  toggleFilter("subject", data.value);
                                }}
                              >
                                {data.name}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    filter.subject.includes(data.value)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                        </CommandGroup>

                        <CommandSeparator />

                        {/* All Classes */}
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() => toggleAll("class", classFilterData)}
                          >
                            All Classes
                            <Check
                              className={cn(
                                "ml-auto",
                                filter.class.length === 0
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        </CommandGroup>

                        {/* Class filter */}
                        <CommandGroup heading="Class">
                          {classFilterData
                            .filter((d) => d.value !== "all")
                            .map((data) => (
                              <CommandItem
                                key={data.value}
                                value={data.value}
                                disabled={filter.class.length === 0} // disable khi All bật
                                onSelect={() => {
                                  if (filter.class.length === 0) return;
                                  toggleFilter("class", data.value);
                                }}
                              >
                                {data.name}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    filter.class.includes(data.value)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </ScrollArea>
                  </Command>
                </PopoverContent>
              </Popover>
              <DropdownMenu onOpenChange={setOpen}>
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
          <div className="overflow-hidden  rounded-md border">
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
                        <TableCell key={cell.id}>
                          {cell.column.id === "user_email"
                            ? String(cell.getValue()).replace(
                                "-gmailcom",
                                "@gmail.com"
                              )
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
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <Button
                variant={"outline"}
                size={"sm"}
                key={i}
                onClick={() => table.setPageIndex(i)}
                className={
                  table.getState().pagination.pageIndex === i
                    ? ""
                    : "text-[#a1a1a1]"
                }
              >
                {i + 1}
              </Button>
            ))}

            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      </ul>
    </div>
  );
}
