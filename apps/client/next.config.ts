import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ['@switch-fiji/ui', '@switch-fiji/auth'],
  images: {
    qualities: [100],
    remotePatterns: [{ protocol: 'https', hostname: '**', port: '', pathname: '**' }]
  }
};

export default nextConfig;
