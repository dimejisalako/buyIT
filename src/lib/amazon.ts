// Parses an Amazon.com product link and returns the ASIN and a clean canonical URL.
// Uses real URL parsing so look-alike hosts (e.g. amazon.com.evil.example) are rejected.
const ASIN = /(?:\/dp\/|\/gp\/product\/)([A-Z0-9]{10})(?:[/?]|$)/i;

export function parseAmazonUrl(raw: string): { asin: string; url: string } | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.toLowerCase();
  if (host !== "amazon.com" && !host.endsWith(".amazon.com")) return null;
  const m = u.pathname.match(ASIN);
  if (!m) return null;
  const asin = m[1].toUpperCase();
  return { asin, url: `https://www.amazon.com/dp/${asin}` };
}
