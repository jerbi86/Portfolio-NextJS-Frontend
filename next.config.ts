import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow common remote patterns if absolute URLs are ever used
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    // Proxy Strapi uploads through Next.js so clients (e.g., phones)
    // don't need direct access to the Strapi host.
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return [];
    return [
      {
        source: '/uploads/:path*',
        destination: `${api}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
