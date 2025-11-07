import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, SendHorizonal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function HomePage() {
  return (
    <main className="w-full ">
      <section className="overflow-hidden h-screen">
        <div className="relative mx-auto w-full px-20 py-28 lg:py-20">
          <div className="lg:flex lg:items-center lg:gap-12">
            <div className="relative top-[7rem] z-10 mx-auto max-w-xl text-center lg:ml-0 lg:w-1/2 lg:text-left">
              <Link
                href="/"
                className="rounded-(--radius) mx-auto flex w-fit items-center gap-2 border p-1 pr-3 lg:ml-0"
              >
                <span className="bg-muted rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs">
                  New
                </span>
                <span className="text-sm">Introduction Upload </span>
                <span className="bg-(--color-border) block h-4 w-px"></span>

                <ArrowRight className="size-4" />
              </Link>

              <div className="flex flex-col gap-8">
                <h1 className="mt-10 text-balance text-3xl font-medium md:text-5xl xl:text-5xl">
                  A Complete Learning Resource for Students
                </h1>
                <p>
                  Discover a rich collection of learning resources, study
                  materials, and inspirational content designed to guide you
                  through every step of your educational journey — helping you
                  achieve your academic goals, develop critical thinking, and
                  grow into a lifelong learner.
                </p>
                <div className="flex gap-4 items-center">
                  <Button variant={"outline"}> Getting Started</Button>
                  <Button variant={"outline"}> Explore Now</Button>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -mx-4 rounded-3xl p-3 lg:col-span-3">
            <div className="relative">
              <div className="bg-radial-[at_65%_25%] to-background z-1 -inset-17 absolute from-transparent to-40%"></div>
              <Image
                className="hidden dark:block"
                src="/418_1x_shots_so.png"
                alt="app illustration"
                width={2796}
                height={2008}
              />
              <Image
                className="dark:hidden"
                src="/preview.png"
                alt="app illustration"
                width={2796}
                height={2008}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
