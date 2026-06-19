import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow images from any HTTPS host (e.g. Yandex Object Storage, VK Cloud, MinIO behind nginx)
      { protocol: "https", hostname: "**" },
      // Allow images from HTTP hosts (e.g. MinIO without TLS on local dev / internal VPS)
      { protocol: "http", hostname: "**" },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
