import Individual from "@/components/individual";
import Link from "next/link";
import React from "react";

export default function PricingPage() {
  return (
    <main className="h-[calc(100vh-60px)] font-semibold flex flex-col gap-4 items-center justify-center">
      {/* <h1 className="text-4xl ">Comming Soon</h1> */}
      <div className="flex flex-col gap-4 items-center">
        {/* <p className="text-xl font-medium">
          Check New in Github Repositories:{" "}
        </p>
        <Link
          className="text-blue-500"
          href="https://github.com/developerplus2025/school-management-system/tree/main"
        >
          https://github.com/developerplus2025/school-management-system/tree/main
        </Link> */}
        <Individual />
      </div>
    </main>
  );
}
