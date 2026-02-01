import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // Required for Cloudflare Pages
  },
};

export default nextConfig;
