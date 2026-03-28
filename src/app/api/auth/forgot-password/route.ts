import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  forgotPasswordLimiter,
  getClientIp,
  checkRateLimit,
  rateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { generateVerificationToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { email } = result.data;

    const ip = getClientIp(request);
    const key = rateLimitKey(ip, email.trim().toLowerCase());
    const { success, reset } = await checkRateLimit(forgotPasswordLimiter, key, {
      fallback: {
        prefix: "forgot-password",
        limit: 3,
        windowMs: 60 * 60 * 1000,
      },
    });

    if (!success) {
      return rateLimitResponse(reset);
    }

    // Always return success to avoid revealing whether account exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = await generateVerificationToken(email);
      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
