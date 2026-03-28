import { NextRequest } from "next/server";
import { handlers } from "@/auth";
import {
  loginLimiter,
  getClientIp,
  checkRateLimit,
  rateLimitKey,
} from "@/lib/rate-limit";

export const { GET } = handlers;

async function getCredentialsIdentifier(
  request: NextRequest
): Promise<string | undefined> {
  try {
    const formData = await request.clone().formData();
    const email = formData.get("email");
    if (typeof email !== "string") return undefined;

    const normalized = email.trim().toLowerCase();
    return normalized.length > 0 ? normalized : undefined;
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  const isCredentialsCallback =
    request.nextUrl.pathname.includes("/callback/credentials");

  if (isCredentialsCallback) {
    const ip = getClientIp(request);
    const identifier = await getCredentialsIdentifier(request);
    const key = rateLimitKey(ip, identifier);
    const { success, reset } = await checkRateLimit(loginLimiter, key, {
      fallback: {
        prefix: "login",
        limit: 5,
        windowMs: 15 * 60 * 1000,
      },
    });

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
