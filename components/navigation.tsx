"use client"
import React from "react";
import { Button } from "./ui/button";
import { authClient } from "@/app/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import UserButtonClient from "./user-button-client";
import Link from "next/link";
const data = [
  {
    id: 1,
    name: "Home",
    src: "/home",
  },
  {
    id: 2,
    name: "Library",
    src: "/library",
  },

  {
    id: 3,
    name: "Pricing",
    src: "/pricing",
  },
  {
    id: 4,
    name: "Changelog",
    src: "/changelog",
  },
  {
    id: 5,
    name: "Docs",
    src: "/docs",
  },
];
export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const signInWithGithub = async () => {
    const data = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });
  };
  const {
    data: session,

    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    authClient.refreshToken;
    refetch();
    router.push("/");
  };
  return (
    <div className="w-full fixed  z-20 top-0 bg-black px-12 border-b flex justify-between items-center border-input h-[60px]">
      <div className="flex gap-8 items-center">
        <Link href={"/home"} className="text-md font-semibold">
          School Management System
        </Link>
        <div className="gap-4 items-center flex">
          {data.map((link) => (
            <Link
              key={link.id}
              className={`link text-sm ${
                pathname === `${link.src}` ? "text-[white]" : "text-[#a1a1a1]"
              }`}
              href={link.src}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="gap-4 flex items-center">
        <Button size={"sm"} variant={"outline"}>
          Contact
        </Button>
        <Button size={"sm"} variant={"outline"}>
          Support
        </Button>
        <UserButtonClient />
      </div>
    </div>
  );
}
