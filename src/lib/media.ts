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

// Rewrite src/href attributes in rich text HTML to absolute URLs against NEXT_PUBLIC_API_URL
export function normalizeRichTextMedia(html?: string | null): string {
  if (!html) return '';
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return html;
  try {
    // Replace src/href attributes pointing to relative /uploads/* or to the API host with absolute URLs
    return html.replace(/\b(src|href)=("|')([^"']+)(\2)/gi, (_m, attr: string, quote: string, val: string) => {
      try {
        // Only rewrite if it's relative or same-host as API
        const u = new URL(val, api);
        // Always force absolute to API
        const abs = u.href;
        return `${attr}=${quote}${abs}${quote}`;
      } catch {
        return `${attr}=${quote}${val}${quote}`;
      }
    });
  } catch {
    return html;
  }
}
