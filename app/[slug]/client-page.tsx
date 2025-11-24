"use client";

import { notFound } from "next/navigation";
import { useSession } from "../lib/auth-client";
import UploadToServer from "./upload-ui";

export default function ClientPage({ slug }: { slug: string }) {
  const { data: session } = useSession();

  

  if (!session) return notFound();

  const decodedSlug = decodeURIComponent(slug);

  if (decodedSlug !== session.user.email) {
    return notFound();
  }

  return <UploadToServer />;
}
