"use client"
import React from "react";
import { Button } from "./ui/button";
import { authClient } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";
import UserButtonClient from "./user-button-client";

export default function Navigation() {
  const router = useRouter()
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
    <div className="w-full fixed  z-20 top-0 bg-black px-12 border-b flex justify-between items-center border-input h-[50px]">
      <div>
        <h1 className="text-md font-semibold">School Management System</h1>
      </div>
      <div className="gap-4 flex items-center">
       <UserButtonClient/>
      </div>
    </div>
  );
}
