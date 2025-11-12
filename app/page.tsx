"use client";
import { redirect } from "next/navigation";
import React from "react";
import { useSession } from "./lib/auth-client";

export default function DirectAccount() {
  const { data: session } = useSession();
  if (session) {
    redirect(`/${session.user.email}`);
  }
}
