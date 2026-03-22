/**
 * Simple in-memory rate limiter.
 * Replace with Redis-backed solution (e.g. @upstash/ratelimit) for production.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}) {
  return {
    check(key: string): { success: boolean; remaining: number } {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { success: true, remaining: limit - 1 };
      }

      if (entry.count >= limit) {
        return { success: false, remaining: 0 };
      }

      entry.count++;
      return { success: true, remaining: limit - entry.count };
    },
  };
}
