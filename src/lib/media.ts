export function toMediaPath(url?: string | null): string {
  if (!url) return "";
  try {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return url; // without API base we can't normalize reliably
    const base = new URL(api);
    const u = new URL(url, api);
    // If URL points to the API host, rewrite to a relative path so it hits our uploads route
    if (u.hostname === base.hostname && u.port === base.port && u.protocol === base.protocol) {
      // Keep query strings if present
      return u.pathname + (u.search || "");
    }
    // Otherwise leave as-is (external hosts allowed via remotePatterns)
    return url;
  } catch {
    // If it's already a relative path, keep it
    return url;
  }
}

export function toAbsoluteMediaUrl(url?: string | null): string {
  if (!url) return "";
  try {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return url;
    const absolute = new URL(url, api);
    return absolute.href;
  } catch {
    return url;
  }
}
