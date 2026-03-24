import { NextRequest } from "next/server";
import { handlers } from "@/auth";
import {
  loginLimiter,
  getClientIp,
  checkRateLimit,
} from "@/lib/rate-limit";

export const { GET } = handlers;

export async function POST(request: NextRequest) {
  const isCredentialsCallback =
    request.nextUrl.pathname.includes("/callback/credentials");

  if (isCredentialsCallback) {
    const ip = getClientIp(request);
    const { success, reset } = await checkRateLimit(loginLimiter, ip);

    if (!success) {
      const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
      const retryMinutes = Math.ceil(retryAfterSeconds / 60);

      // Must include a `url` field with an error param — the next-auth/react
      // signIn() client always parses `new URL(data.url)` (line 174 of react.js),
      // regardless of HTTP status. Without a valid url, it throws "Invalid URL".
      const errorUrl = new URL("/sign-in", request.nextUrl.origin);
      errorUrl.searchParams.set("error", "RateLimited");

      return Response.json(
        {
          url: errorUrl.toString(),
          error: `Too many attempts. Please try again in ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSeconds) },
        }
      );
    }
  }

  return handlers.POST(request);
}
