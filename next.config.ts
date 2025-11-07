import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    remotePatterns: [
      new URL("http://127.0.0.1:8000/**"),
      new URL("https://avatars.githubusercontent.com/**"),
    ],

    // localPatterns: [
    //   {
    //     pathname: "https://avatars.githubusercontent.com/**",
    //   },
    // ],
  },
};

export default nextConfig;
