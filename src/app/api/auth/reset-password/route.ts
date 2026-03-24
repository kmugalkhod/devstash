import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateVerificationToken } from "@/lib/tokens";
import {
  resetPasswordLimiter,
  getClientIp,
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { success, reset } = await checkRateLimit(resetPasswordLimiter, ip);

    if (!success) {
      return rateLimitResponse(reset);
    }

    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input." },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    const email = await validateVerificationToken(token);

    if (!email) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
