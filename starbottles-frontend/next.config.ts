import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "placehold.co" },
      { hostname: "localhost" },
      { hostname: "127.0.0.1" },
      // Cloudflare R2 product images
      { protocol: "https", hostname: "pub-3ac8dfa528c245f39b68fb9600dd0cb9.r2.dev" },
    ],
  },
};

export default nextConfig;
