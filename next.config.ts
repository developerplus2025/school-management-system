import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("http://127.0.0.1:8000/**")],
  },
};

export default nextConfig;
