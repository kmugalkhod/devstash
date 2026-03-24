import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
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
  key: string
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
    console.error("Rate limit check failed, allowing request:", error);
    // Fail open — allow the request if Upstash is unavailable
    return { success: true, remaining: -1, reset: 0 };
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
