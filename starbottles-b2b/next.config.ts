import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    // In dev, skip image optimization to avoid SSRF protection blocking localhost
    unoptimized: isDev,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shop.starbottles.in",
        pathname: "/wp-content/uploads/**",
      },
      // Laravel backend (dev) — images from storage
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8001",
      },
      // Laravel backend (production)
      {
        protocol: "https",
        hostname: "starbottles.in",
        pathname: "/storage/**",
      },
      // Cloudflare R2 product images
      {
        protocol: "https",
        hostname: "pub-3ac8dfa528c245f39b68fb9600dd0cb9.r2.dev",
      },
      // Placeholder images (demo)
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
