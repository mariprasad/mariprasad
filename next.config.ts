import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "a.ltrbxd.com" },
      { protocol: "https", hostname: "**.ltrbxd.com" },
    ],
  },
};

export default nextConfig;
