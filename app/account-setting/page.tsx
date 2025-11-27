"use client";

import { useState } from "react";
import Image from "next/image";
import { authClient } from "../lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SocialAccount = {
  provider: string;
  providerAccountId: string;
  avatarUrl?: string;
};

type ExtendedUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  socialAccounts?: SocialAccount[];
};

export default function AccountSettings() {
  const sessionState = authClient.useSession();
  const user = sessionState.data?.user as ExtendedUser | undefined;

  const fallbackAvatar = "/default-avatar.png";

  // Lấy avatar từ social (Google / Github)
  const getSocialAvatar = () => {
    const social = user?.socialAccounts?.[0];
    return social?.avatarUrl ?? fallbackAvatar;
  };

  // Avatar khởi tạo
  const initialAvatar = user?.image || getSocialAvatar() || fallbackAvatar;

  const [avatar, setAvatar] = useState<string>(initialAvatar);
  const [loading, setLoading] = useState(false);

  // -------------------------
  // UPLOAD AVATAR
  // -------------------------
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);

    const fd = new FormData();
    fd.append("user_email", user.email);
    fd.append("file", file);

    try {
      // Upload file
      const upload = await fetch("http://127.0.0.1:8000/upload/avatar", {
        method: "POST",
        body: fd,
      });

      const data = await upload.json();
      const newUrl = data.avatar_url;

      // Update avatar trong BetterAuth
      await authClient.updateUser({ image: newUrl });

      // Update UI rất nhanh
      setAvatar(newUrl);
    } catch (err) {
      console.error("Upload avatar lỗi:", err);
      alert("Upload avatar thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // DELETE AVATAR
  // -------------------------
  const handleDeleteAvatar = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Gọi API xoá avatar
      await fetch("http://127.0.0.1:8000/delete/avatar", {
        method: "POST",
        body: JSON.stringify({ user_email: user.email }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Nếu login bằng Google/Github → fallback
      const fallback = getSocialAvatar() || fallbackAvatar;

      // Update user
      await authClient.updateUser({ image: fallback });

      // Update UI
      setAvatar(fallback);
    } catch (err) {
      console.error("Xoá avatar lỗi:", err);
      alert("Không thể xoá avatar!");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Đang tải...</div>;

  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={avatar}
            alt="Avatar"
            width={100}
            height={100}
            className="rounded-full border"
          />

          <div className="flex flex-col gap-2">
            <Button asChild disabled={loading}>
              <label className="cursor-pointer">
                Thay đổi avatar
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteAvatar}
              disabled={loading}
            >
              Xoá avatar
            </Button>

            {loading && (
              <p className="text-sm text-muted-foreground">Đang xử lý...</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
