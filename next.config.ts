import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: "files.notion.so" },
      { hostname: "prod-files-secure.s3.us-west-2.amazonaws.com" },
    ],
  },
};

export default nextConfig;
