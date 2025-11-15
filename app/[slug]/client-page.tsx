"use client";

import { notFound } from "next/navigation";
import { useSession } from "../lib/auth-client";
import UploadToServer from "./upload-ui";


export default function ClientPage({ slug }: { slug: string }) {
  const { data: session, } = useSession();

 
  if (!session) return <div>Bạn cần đăng nhập</div>;

  const email = session.user.email.replace("@", "%40");
  console.log(slug)

  // Chỉ cho phép slug trùng email user
  if (slug !== email) {
    return notFound();
  }

  return <UploadToServer />;
}
