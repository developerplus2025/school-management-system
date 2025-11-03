"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HomeSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { filename: string; user_id: string; download_url: string }[]
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
    <div className="w-full px-12 mx-auto mt-24 flex flex-col items-center gap-6">
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

        <div className="grid grid-cols-4 w-full justify-items-center gap-8">
          {results.map((file, idx) => {
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.filename);
            return (
              <li
                key={idx}
                className="flex flex-col gap-4 items-center justify-between rounded-md p-3"
              >
                <div className="flex flex-col items-center gap-3">
                  {isImage && (
                    <img
                      src={file.download_url}
                      alt={file.filename}
                      className="w-[200px] h-[200px] rounded-md object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm truncate max-w-[200px]">
                      {file.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      User: {file.user_id}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(file.download_url, "_blank")}
                >
                  Download
                </Button>
              </li>
            );
          })}
        </div>
      </ul>

      {loading && (
        <p className="text-sm text-muted-foreground text-center">Loading...</p>
      )}
    </div>
  );
}
