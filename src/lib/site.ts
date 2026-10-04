export const siteUrl = (request?: Request): string =>
  (process.env.SITE_URL || (request ? new URL(request.url).origin : "http://localhost:3000")).replace(/\/$/, "");

export const trackUrl = (base: string, id: string, token: string) => `${base}/track/${id}?t=${token}`;
