import type { NextConfig } from "next";

// Build up image remote patterns dynamically to support the configured API host in production
const baseRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
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
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (apiUrl) {
  try {
    const u = new URL(apiUrl);
    const proto = (u.protocol.replace(':', '') as 'http' | 'https');
    baseRemotePatterns.push({
      protocol: proto,
      hostname: u.hostname,
      // Only include port if present
      ...(u.port ? { port: u.port } : {}),
      pathname: '/**',
    } as any);
  } catch {
    // ignore invalid URL; rely on base patterns
  }
}

const nextConfig: NextConfig = {
  images: {
    // Allow common remote patterns if absolute URLs are ever used
    remotePatterns: baseRemotePatterns,
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
