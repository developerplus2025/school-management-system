"use client";

import { notFound } from "next/navigation";
import { useSession } from "../lib/auth-client";
import UploadToServer from "./upload-ui";
import { auth } from "@/lib/auth";

export default function ClientPage({ slug }: { slug: string }) {
  const encodeEmail = (email: string) => {
    return email.replace("@", "-").replace(/\./g, "");
  };
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;

  if (!session) return notFound();

  const decodedSlug = decodeURIComponent(slug);

  if (decodedSlug !== encodeEmail(session.user.email)) return notFound();

  return <UploadToServer />;
}
