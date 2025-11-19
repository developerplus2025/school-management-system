"use client";

import { useSession } from "../lib/auth-client";
import UploadToServer from "./upload-ui";

export default function ClientPage({ slug }: { slug: string }) {
  const { data: session, isPending } = useSession();

  if (isPending) return <p>Loading...</p>;

  if (!session) return <p>Access denied</p>;

  const decodedSlug = decodeURIComponent(slug);

  if (decodedSlug !== session.user.email) {
    return <p>Access denied</p>;
  }

  return <UploadToServer />;
}
