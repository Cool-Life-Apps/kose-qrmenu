import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    domains: ['i.ibb.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.sitkiusta.com.tr',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
