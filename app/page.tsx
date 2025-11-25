"use client";
import { redirect } from "next/navigation";
import React from "react";
import { useSession } from "./lib/auth-client";

export default function DirectAccount() {
  const { data: session } = useSession();
   const encodeEmail = (email: string) => {
     return email.replace("@", "-").replace(/\./g, "");
   };
   if (session) {
     redirect(`/${encodeEmail(session.user.email)}`);
   }
}
