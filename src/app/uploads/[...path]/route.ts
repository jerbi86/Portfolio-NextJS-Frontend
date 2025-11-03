import type { NextRequest } from "next/server";

// Ensure this route runs in the Node.js runtime so HTTP (non-HTTPS) Strapi endpoints are allowed
// and to avoid Edge runtime restrictions when proxying images.
export const runtime = 'nodejs';
// Always treat as dynamic to avoid unexpected caching issues for images.
export const dynamic = 'force-dynamic';

// Proxy /uploads/* to the Strapi API host so that:
// - Client-side CSS background images using relative URLs work in production
// - next/image optimizer can fetch relative /uploads/* from the same origin
// This complements next.config.ts rewrites and is more reliable for server-side fetches.
// In Next.js 15+, context.params may be a Promise; accept that shape and await it.
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) {
    return new Response("Missing NEXT_PUBLIC_API_URL", { status: 500 });
  }

  const { path: pathSegs = [] } = await context.params;
  const target = `${api.replace(/\/$/, "")}/uploads/${pathSegs.map(encodeURIComponent).join("/")}`;

  // Forward a minimal set of headers that matter for images (Range for partial content, etc.)
  const fwdHeaders: Record<string, string> = {};
  const range = req.headers.get("range");
  if (range) fwdHeaders["range"] = range;
  const accept = req.headers.get("accept");
  if (accept) fwdHeaders["accept"] = accept;

  const res = await fetch(target, {
    method: "GET",
    headers: fwdHeaders,
    // Let upstream control caching; avoid Next caching stale images implicitly here
    cache: "no-store",
    // Strapi may be on a different origin; allow streaming
    redirect: "follow",
  });

  // Pass through essential headers for images
  const outHeaders = new Headers();
  const passthrough = [
    "content-type",
    "content-length",
    "cache-control",
    "etag",
    "last-modified",
    "accept-ranges",
    "content-range",
  ];
  for (const [key, value] of res.headers.entries()) {
    if (passthrough.includes(key.toLowerCase())) {
      outHeaders.set(key, value);
    }
  }

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: outHeaders,
  });
}
