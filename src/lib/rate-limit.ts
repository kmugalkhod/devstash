import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ONE_MINUTE_MS = 60 * 1000;
const localFallbackAttempts = new Map<string, number[]>();

const IP_V4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IP_V6_REGEX = /^[a-f0-9:]+$/i;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Pre-configured rate limiters for auth endpoints.
 * Uses sliding window algorithm for smooth limiting.
 */

// Login: 5 attempts per 15 minutes (keyed by IP + email)
export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "ratelimit:login",
  analytics: false,
});

// Registration: 3 attempts per 1 hour (keyed by IP)
export const registerLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "ratelimit:register",
  analytics: false,
});

// Forgot password: 3 attempts per 1 hour (keyed by IP)
export const forgotPasswordLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "ratelimit:forgot-password",
  analytics: false,
});

// Reset password: 5 attempts per 15 minutes (keyed by IP)
export const resetPasswordLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "ratelimit:reset-password",
  analytics: false,
});

// Resend verification: 3 attempts per 15 minutes (keyed by IP + email)
export const resendVerificationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "15 m"),
  prefix: "ratelimit:resend-verification",
  analytics: false,
});

interface RateLimitFallbackConfig {
  prefix: string;
  limit: number;
  windowMs: number;
}

interface CheckRateLimitOptions {
  failOpen?: boolean;
  fallback?: RateLimitFallbackConfig;
}

function normalizeIp(candidate: string | null): string | null {
  if (!candidate) return null;

  const value = candidate.trim();
  if (!value) return null;
  if (value.length > 64) return null;

  if (IP_V4_REGEX.test(value)) return value;
  if (value.includes(":")) {
    const compact = value.replace(/::/g, "").replace(/:/g, "");
    if (compact.length > 0 && compact.length <= 32 && IP_V6_REGEX.test(value)) {
      return value.toLowerCase();
    }
  }

  return null;
}

function getSingleForwardedIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return null;

  const parts = forwarded
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length !== 1) return null;
  return normalizeIp(parts[0]);
}

function checkLocalFallbackRateLimit(
  key: string,
  fallback: RateLimitFallbackConfig
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const bucketKey = `${fallback.prefix}:${key}`;
  const windowStart = now - fallback.windowMs;

  const attempts = (localFallbackAttempts.get(bucketKey) ?? []).filter(
    (timestamp) => timestamp > windowStart
  );

  const allowed = attempts.length < fallback.limit;
  if (allowed) {
    attempts.push(now);
  }

  localFallbackAttempts.set(bucketKey, attempts);

  const remaining = Math.max(0, fallback.limit - attempts.length);
  const reset =
    attempts.length > 0 ? attempts[0] + fallback.windowMs : now + fallback.windowMs;

  return { success: allowed, remaining, reset };
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const trustedHeaders = [
    "cf-connecting-ip",
    "x-real-ip",
    "x-vercel-forwarded-for",
    "fly-client-ip",
  ];

  for (const header of trustedHeaders) {
    const ip = normalizeIp(request.headers.get(header));
    if (ip) return ip;
  }

  const forwardedIp = getSingleForwardedIp(request);
  if (forwardedIp) return forwardedIp;

  return "unknown";
}

/**
 * Build a rate limit key from IP and optional identifier (e.g. email).
 */
export function rateLimitKey(ip: string, identifier?: string): string {
  return identifier ? `${ip}:${identifier}` : ip;
}

/**
 * Check rate limit with fail-open behavior.
 * If Upstash is unavailable, allows the request through.
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  key: string,
  options: CheckRateLimitOptions = {}
): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  try {
    const result = await limiter.limit(key);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);

    if (options.failOpen) {
      return { success: true, remaining: -1, reset: 0 };
    }

    if (options.fallback) {
      return checkLocalFallbackRateLimit(key, options.fallback);
    }

    return { success: false, remaining: 0, reset: Date.now() + ONE_MINUTE_MS };
  }
}

/**
 * Create a 429 response with Retry-After header and user-friendly message.
 */
export function rateLimitResponse(reset: number): Response {
  const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
  const retryMinutes = Math.ceil(retryAfterSeconds / 60);

  return Response.json(
    {
      error: `Too many attempts. Please try again in ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  );
}
