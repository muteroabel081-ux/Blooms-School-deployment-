import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-19c6e3fa-ad3f-4e8b-9518-6ffd02e066ed.space-z.ai",
  ],
};

export default nextConfig;
