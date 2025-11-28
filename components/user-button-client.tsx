"use client";
import {
  useClick,
  useInteractions,
  useFloating,
  offset,
  flip,
  shift,
  size,
  autoUpdate,
  limitShift,
  hide,
  arrow as floatingUIarrow,
  FloatingFocusManager,
  useTransitionStyles,
  useDismiss,
  useTransitionStatus,
} from "@floating-ui/react";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
// import { ThemeToggle } from "./ThemeToggle";
// import FeedBack from "./feedback";
// import GitHub from "./GitHub";
// import X from "./x";
// import { Loader } from "./ui/loader";

// import Image from "next/image";
// import ThemeToggleButton from "./ui/theme-toggle-button";
// import { SearchUi } from "./search-ui";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { authClient } from "@/app/lib/auth-client";
import Image from "next/image";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "./ui/avatar";
function removeVietnameseTones(str?: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

const itemsPartOne = [
  {
    name: "Account Setting",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="23"
        fill="#ffffff"
        viewBox="0 0 256 256"
      >
        <path d="M216,130.16q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.6,107.6,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.29,107.29,0,0,0-26.25-10.86,8,8,0,0,0-7.06,1.48L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.6,107.6,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"></path>
      </svg>
    ),
    directLink: "account-setting",
  },
  {
    name: "DashBoard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="23"
        fill="#ffffff"
        viewBox="0 0 256 256"
      >
        <path d="M216,72H131.31L104,44.69A15.88,15.88,0,0,0,92.69,40H40A16,16,0,0,0,24,56V200.62A15.41,15.41,0,0,0,39.39,216h177.5A15.13,15.13,0,0,0,232,200.89V88A16,16,0,0,0,216,72ZM40,56H92.69l16,16H40Z"></path>
      </svg>
    ),
    directLink: `user`,
  },
  {
    name: "Create Projects",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="23"
        fill="#ffffff"
        viewBox="0 0 256 256"
      >
        <path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24Zm40,112H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32a8,8,0,0,1,0,16Z"></path>
      </svg>
    ),
    directLink: "create-projects",
  },
];
const itemsPartTwo = [
  {
    name: "Home Page",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="23"
        fill="#ffffff"
        viewBox="0 0 256 256"
      >
        <path d="M224,120v96a8,8,0,0,1-8,8H160a8,8,0,0,1-8-8V164a4,4,0,0,0-4-4H108a4,4,0,0,0-4,4v52a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V120a16,16,0,0,1,4.69-11.31l80-80a16,16,0,0,1,22.62,0l80,80A16,16,0,0,1,224,120Z"></path>
      </svg>
    ),
    directLink: "home",
  },
  {
    name: "Pricing",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="23"
        fill="#ffffff"
        viewBox="0 0 256 256"
      >
        <path d="M239.71,74.14l-25.64,92.28A24.06,24.06,0,0,1,191,184H92.16A24.06,24.06,0,0,1,69,166.42L33.92,40H16a8,8,0,0,1,0-16H40a8,8,0,0,1,7.71,5.86L57.19,64H232a8,8,0,0,1,7.71,10.14ZM88,200a16,16,0,1,0,16,16A16,16,0,0,0,88,200Zm104,0a16,16,0,1,0,16,16A16,16,0,0,0,192,200Z"></path>
      </svg>
    ),
    directLink: "pricing",
  },
  {
    name: "Documention",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="23"
        fill="#ffffff"
        viewBox="0 0 256 256"
      >
        <path d="M240,56V200a8,8,0,0,1-8,8H160a24,24,0,0,0-24,23.94,7.9,7.9,0,0,1-5.12,7.55A8,8,0,0,1,120,232a24,24,0,0,0-24-24H24a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8H88a32,32,0,0,1,32,32v87.73a8.17,8.17,0,0,0,7.47,8.25,8,8,0,0,0,8.53-8V80a32,32,0,0,1,32-32h64A8,8,0,0,1,240,56Z"></path>
      </svg>
    ),
    directLink: "docs",
  },
];
export default function UserButtonClient() {
  const router = useRouter();
  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };
  const {
    data: session,

    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient.useSession();
  const userName = session?.user.name;
  const handleLogout = async () => {
    await authClient.signOut();
    authClient.refreshToken;
    refetch();
    window.location.reload();
    window.location.href = "home";
    router.push("/home");
  };
  const variants = {
    visible: { opacity: 1, display: "flex" },
    hidden: { opacity: 0, transitionEnd: { display: "none" } },
  };
  const [open, setOpen] = useState("closed");
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const name = session?.user.name;
  const cleanName = removeVietnameseTones(name); // "Pham Quang Truong An"

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-end",
    strategy: "absolute",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      size({
        apply: ({ elements, rects, availableWidth, availableHeight }) => {
          const { width: anchorWidth, height: anchorHeight } = rects.reference;
          const contentStyle = elements.floating.style;
          contentStyle.setProperty(
            "--radix-popper-available-width",
            `${availableWidth}px`
          );
          contentStyle.setProperty(
            "--radix-popper-available-height",
            `${availableHeight}px`
          );
          contentStyle.setProperty(
            "--radix-popper-anchor-width",
            `${anchorWidth}px`
          );
          contentStyle.setProperty(
            "--radix-popper-anchor-height",
            `${anchorHeight}px`
          );
        },
      }),
    ],
  });

  const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });

  // 👇 Transition hook from Floating UI
  const { isMounted } = useTransitionStatus(context, {
    duration: {
      open: 200,
      close: 100,
    },
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);
  const signInWithGithub = async () => {
    const data = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });
  };
  const encodeEmail = (email: string) => {
    return email.replace("@", "-").replace(/\./g, "");
  };
  const imageUrl =
    session?.user.image ||
    `https://avatar.vercel.sh/${encodeURIComponent(userName)}?size=60`;
  if (isPending) {
    return <div />;
  }
  return (
    <div className={`flex items-center gap-4`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={!isPending ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`${
          !isPending ? "" : "pointer-events-none"
        } flex items-center gap-2`}
      >
        {/* <div
          style={{
            backgroundColor:
              "color-mix(in oklab,var(--color-fd-secondary)50%,transparent)",
          }}
          onClick={() => {
            setOpenSearch(true);
          }}
          className="flex h-[32px] w-fit cursor-pointer items-center justify-center gap-2 rounded-full border border-(--input) p-3 select-none"
        >
          <svg
            onClick={() => {
              setOpenSearch(true);
            }}
            className="size-4.5 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#ffffff"
            viewBox="0 0 256 256"
          >
            <title>Search Icon</title>
            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
          </svg>
          <p className="text-xs text-[#a1a1a1]"> Search for documents</p>
          <div className="flex gap-1">
            <kbd className="text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-(--input) px-1.5 font-sans text-[10px] font-medium opacity-100 select-none">
              <span className="text-xs">Ctrl</span>
            </kbd>
            <kbd className="text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-(--input) px-1.5 font-sans text-[10px] font-medium opacity-100 select-none">
              <span className="text-xs">K</span>
            </kbd>
          </div>
        </div> */}
        {/* <SearchUi /> */}
        {/* <div className="hover:bg-muted flex h-[30px] w-[37px] cursor-pointer items-center justify-center rounded-md border transition-all duration-200 ease-out dark:hover:bg-[#101010]">
        <Link
          href={"https://github.com/developerplus2025/decent-over-nextjs-15/"}
        >
          {" "}
          <GitHub />
        </Link>
      </div>
      <div className="hover:bg-muted flex h-[30px] w-[37px] cursor-pointer items-center justify-center rounded-md border transition-all duration-200 ease-out dark:hover:bg-[#101010]">
        <Link href={"https://x.com/DeveloperPlus24"}><X /></Link>
      </div> */}

        {/* <ThemeToggleButton /> */}

        {/* <FeedBack /> */}
        {session?.user && (
          <div>
            <div
              ref={(node) => refs.setReference(node)}
              {...getReferenceProps()}
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer"
            >
              <Avatar className="">
                <AvatarImage className=" rounded-full size-8" src={imageUrl} />
                <AvatarFallback>{userName[0]}</AvatarFallback>
              </Avatar>
              {/* {session && session.user && session.user.image ? (
                <img
                  height={40}
                  width={40}
                  alt={session.user.image}
                  src={session.user.image}
                  className="h-[2.1rem] w-[2.1rem] rounded-full"
                />
              ) : (
                <div className="h-[2.1rem] w-[2.1rem] cursor-pointer rounded-full bg-linear-to-r from-cyan-500 to-blue-500" />
              )} */}
            </div>

            {isMounted && (
              <div
                {...getFloatingProps()}
                ref={(node) => {
                  refs.setFloating(node);
                }}
                style={floatingStyles}
              >
                <div
                  data-state={isOpen ? "open" : "closed"}
                  data-side="right"
                  className="data-[state=open]:animate-in data data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 flex h-fit w-[16rem] flex-col justify-between rounded-xl border border-[#2c2c2c] bg-black"
                >
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex flex-col gap-1 px-4 py-2">
                      <h1 className="text-sm">{cleanName}</h1>
                      <span className="text-sm text-[#a1a1a1]">
                        {session?.user?.email ?? ""}
                      </span>
                    </div>
                    <div className="border-b border-b-[#302f2f]"></div>
                    <div className="flex w-full flex-col gap-2 px-4 py-2 [&_svg]:size-4">
                      {itemsPartOne.map((itemsPartOne) => (
                        <Button
                          key={itemsPartOne.name}
                          onMouseEnter={() => {
                            setIsHovered(true); // Khi bắt đầu hover
                            console.log("Hovered");
                          }}
                          onMouseLeave={() => {
                            setIsHovered(false); // Khi kết thúc hover
                            console.log("Unhovered");
                          }}
                          className={`w-full border-none ${
                            isHovered ? "bg-primary/90" : "bg-black"
                          } justify-between`}
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/${
                                itemsPartOne.directLink == "user"
                                  ? encodeEmail(session.user.email)
                                  : itemsPartOne.directLink
                              }`
                            )
                          }
                        >
                          {itemsPartOne.name}
                          {itemsPartOne.icon}
                        </Button>
                      ))}
                    </div>
                    <div className="border-b border-b-[#302f2f]"></div>
                    <div className="flex flex-col gap-2 px-4 py-2">
                      {itemsPartTwo.map((itemsPartTwo) => (
                        <Button
                          key={itemsPartTwo.name}
                          onMouseEnter={() => {
                            setIsHovered(true); // Khi bắt đầu hover
                            console.log("Hovered");
                          }}
                          onMouseLeave={() => {
                            setIsHovered(false); // Khi kết thúc hover
                            console.log("Unhovered");
                          }}
                          className={`w-full border-none ${
                            isHovered ? "bg-primary/90" : "bg-black"
                          } justify-between`}
                          variant="outline"
                          onClick={() =>
                            router.push(`/${itemsPartTwo.directLink}`)
                          }
                        >
                          {itemsPartTwo.name}
                          {itemsPartTwo.icon}
                        </Button>
                      ))}

                      <Button
                        onMouseEnter={() => {
                          setIsHovered(true); // Khi bắt đầu hover
                          console.log("Hovered");
                        }}
                        onMouseLeave={() => {
                          setIsHovered(false); // Khi kết thúc hover
                          console.log("Unhovered");
                        }}
                        className={`w-full border-none ${
                          isHovered ? "bg-primary/90" : "bg-black"
                        } justify-between`}
                        variant="outline"
                        onClick={() => {
                          handleLogout();
                          router.push("/home");
                        }}
                      >
                        Logout
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="23"
                          height="23"
                          fill="#ffffff"
                          viewBox="0 0 256 256"
                        >
                          <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40A8,8,0,0,0,176,88v32H112a8,8,0,0,0,0,16h64v32a8,8,0,0,0,13.66,5.66l40-40A8,8,0,0,0,229.66,122.34Z"></path>
                        </svg>
                      </Button>
                    </div>
                    <div className="border-b border-b-[#302f2f]"></div>
                    <div className="flex flex-col px-4 py-2">
                      <Button>Upgrade to Pro</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {!session?.user && (
          <div>
            <motion.div
              variants={variants}
              // initial={session?.user ? "hidden" : "visible"}
              // animate={session?.user ? "hidden" : "visible"}
              transition={{ duration: 0.5, ease: "easeOut", delay: 4 }}
              className="flex items-center gap-4"
            >
              <div
                onClick={() => signInWithGoogle()}
                className="flex items-center justify-center gap-3"
              >
                <motion.div
                  className="relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Button
                    variant="outline"
                    className="hover:bg-accent flex h-8 items-center dark:hover:bg-[#1a1a1a]"
                  >
                    Sign In
                  </Button>
                </motion.div>
              </div>

              <div onClick={() => signInWithGoogle()}>
                <motion.div
                  className="relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Button
                    variant="outline"
                    className="h-8 gap-1 [&_svg]:size-[15px]"
                  >
                    Create Account
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
