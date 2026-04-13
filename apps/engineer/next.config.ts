import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@workspace/ui", "@workspace/auth", "@workspace/api"],
  images: {
    qualities: [100],
    remotePatterns: [
      { protocol: "https", hostname: "**", port: "", pathname: "**" },
    ],
  },
};

export default nextConfig;
