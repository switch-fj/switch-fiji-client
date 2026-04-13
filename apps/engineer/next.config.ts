import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@workspace/ui", "@workspace/auth"],
  images: {
    qualities: [100],
    remotePatterns: [
      { protocol: "https", hostname: "**", port: "", pathname: "**" },
    ],
  },
};

export default nextConfig;
