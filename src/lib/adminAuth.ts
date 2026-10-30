import { timingSafeEqual } from 'crypto';

// Admin access is checked against the ADMIN_KEY env var, sent in the x-admin-key header.
// If ADMIN_KEY is not set, every admin request is refused.
export function isAdmin(request: Request): boolean {
  const expected = process.env.ADMIN_KEY;
  const provided = request.headers.get('x-admin-key');
  if (!expected || !provided) return false;

  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}
