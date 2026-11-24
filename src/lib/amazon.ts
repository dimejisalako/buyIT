// Understands the Amazon links people actually paste: full product links, and the short links
// (a.co, amzn.to) that Amazon's phone app produces when you tap Share.
// Uses real URL parsing so look-alike hosts (e.g. amazon.com.evil.example) are rejected.
const ASIN = /(?:\/dp\/|\/gp\/product\/)([A-Z0-9]{10})(?:[/?]|$)/i;

const SHORT_HOSTS = new Set(["a.co", "www.a.co", "amzn.to", "www.amzn.to", "amzn.com", "www.amzn.com"]);

const isAmazonHost = (host: string) => host === "amazon.com" || host.endsWith(".amazon.com");

function toUrl(raw: string): URL | null {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u : null;
  } catch {
    return null;
  }
}

export type AmazonLink =
  | { kind: "product"; asin: string; url: string }
  | { kind: "short"; url: string };

export function classifyAmazonUrl(raw: string): AmazonLink | null {
  const u = toUrl(raw);
  if (!u) return null;
  const host = u.hostname.toLowerCase();

  if (isAmazonHost(host)) {
    const m = u.pathname.match(ASIN);
    if (!m) return null;
    const asin = m[1].toUpperCase();
    return { kind: "product", asin, url: "https://www.amazon.com/dp/" + asin };
  }
  if (SHORT_HOSTS.has(host) && u.pathname.length > 1) {
    return { kind: "short", url: "https://" + host + u.pathname + u.search };
  }
  return null;
}

// Back-compat helper: the ASIN and canonical URL for a full product link, otherwise null.
export function parseAmazonUrl(raw: string): { asin: string; url: string } | null {
  const link = classifyAmazonUrl(raw);
  return link && link.kind === "product" ? { asin: link.asin, url: link.url } : null;
}

// Follows a short link's redirects (a few hops, only to Amazon hosts) to find the real product page.
// Returns null if it can't be resolved; the caller then keeps the short link for the admin to open.
export async function resolveShortLink(link: { url: string }): Promise<{ asin: string; url: string } | null> {
  let current = link.url;
  for (let hop = 0; hop < 4; hop++) {
    const u = toUrl(current);
    if (!u) return null;
    const host = u.hostname.toLowerCase();
    if (!SHORT_HOSTS.has(host) && !isAmazonHost(host)) return null;

    const direct = parseAmazonUrl(current);
    if (direct) return direct;

    try {
      const res = await fetch(current, { redirect: "manual", signal: AbortSignal.timeout(3000), headers: { "user-agent": "Mozilla/5.0" } });
      const location = res.headers.get("location");
      if (res.status < 300 || res.status >= 400 || !location) return null;
      current = new URL(location, current).toString();
    } catch {
      return null;
    }
  }
  return parseAmazonUrl(current);
}

// A readable item name guessed from the link, e.g. ".../Sony-WH-1000XM5-Headphones/dp/B09..." becomes
// "Sony WH 1000XM5 Headphones". The admin replaces it with the real name when preparing the quote.
export function guessTitle(raw: string, asin?: string): string {
  const u = toUrl(raw);
  const segment = u?.pathname.match(/^\/([^/]+)\/(?:dp|gp\/product)\//i)?.[1];
  if (segment) {
    try {
      const text = decodeURIComponent(segment).replace(/[-_+]+/g, " ").replace(/\s+/g, " ").trim();
      if (text.length >= 3) return text.slice(0, 120);
    } catch {
      // fall through
    }
  }
  return asin ? "Amazon item " + asin : "Amazon item";
}
