import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Library ",
  description: "",
};
export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex w-full h-[calc(100vh-40px)] items-center justify-center overflow-y-hidden">
      {children}
    </section>
  );
}
