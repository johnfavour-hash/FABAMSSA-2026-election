import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/((?!_next/|api/|assets/).*)',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;