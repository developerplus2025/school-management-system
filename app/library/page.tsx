"use client";

import { JSX, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
type FileItem = { filename: string; download_url: string; user_id?: string };

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

export default function HomeSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { filename: string; user_email: string; download_url: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Hàm gọi API tìm kiếm
  const handleSearch = async (searchText: string) => {
    setLoading(true);
    try {
      const url =
        searchText.trim() === ""
          ? "http://127.0.0.1:8000/search?query=*"
          : `http://127.0.0.1:8000/search?query=${encodeURIComponent(
              searchText
            )}`;

      const res = await fetch(url);
      const data = await res.json();
      console.log(data);
      setResults(data.results || []);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm:", err);
    } finally {
      setLoading(false);
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

  return (
    <div className="w-full h-[calc(100vh-60px)] pt-12 px-12 mx-auto  flex flex-col items-center gap-6">
      {/* Thanh tìm kiếm */}
      <div className="flex w-full justify-center gap-8">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter file name to search..."
          className="w-[500px]"
        />
      </div>

      <ul>
        {!loading && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            No results found.
          </p>
        )}

        <ScrollArea className="h-[500px] px-4 ">
          {" "}
          <div className="grid grid-cols-1 w-full justify-items-center gap-8">
            {results.map((file, idx) => {
              // ✅ 1. Kiểm tra xem có phải hình ảnh không
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.filename);

              // ✅ 2. Lấy phần mở rộng file (luôn đảm bảo là string)
              const ext = file.filename.includes(".")
                ? file.filename.split(".").pop()!.toLowerCase()
                : "unknown";

              return (
                <li
                  key={idx}
                  className="flex border w-[700px] border-input flex-col gap-4   rounded-md p-3"
                >
                  <div className="flex flex-col w-full items-center gap-3">
                    {/* ✅ Hiển thị icon dựa vào phần mở rộng */}

                    {/* ✅ Nếu là hình ảnh thì hiển thị preview */}
                    {/* {isImage && (
                      <img
                        loading="lazy"
                        src={file.download_url}
                        alt={file.filename}
                        className="w-[200px] h-[200px] rounded-md object-cover"
                      />
                    )} */}

                    {/* ✅ Thông tin file (ẩn mặc định) */}
                    <div className="flex gap-8 w-full">
                      <div className="">
                        {data[ext]?.icon || data.unknown.icon}
                      </div>
                      <div className="">
                        <p className="font-medium text-sm ">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          User: {file.user_email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Các nút chức năng */}
                  <div className="flex gap-8 w-fit justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.download_url, "_blank")}
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.download_url, "_blank")}
                    >
                      View More
                    </Button>
                  </div>
                </li>
              );
            })}
          </div>{" "}
        </ScrollArea>
      </ul>

      {/* {loading && (
        <div className="grid grid-cols-5 w-full justify-items-center gap-8">
          <li className="flex border border-input flex-col gap-4 items-center justify-between rounded-md p-3">
            {" "}
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="w-[200px] h-[200px]  rounded-md object-cover" />
            </div>
            <div className="flex gap-8 justify-between">
              <Skeleton className="text-sm h-5 w-[100px]"></Skeleton>
              <Skeleton className="text-sm h-5 w-[100px]"></Skeleton>
            </div>
          </li>
        </div>
      )} */}
    </div>
  );
}
