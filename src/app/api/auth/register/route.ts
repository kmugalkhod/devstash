import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  registerLimiter,
  getClientIp,
  checkRateLimit,
  rateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input. Check your name, email, and password." },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const ip = getClientIp(request);
    const key = rateLimitKey(ip, email.trim().toLowerCase());
    const { success, reset } = await checkRateLimit(registerLimiter, key, {
      fallback: {
        prefix: "register",
        limit: 3,
        windowMs: 60 * 60 * 1000,
      },
    });

    if (!success) {
      return rateLimitResponse(reset);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const emailVerificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED !== "false";

    if (emailVerificationEnabled) {
      try {
        const token = await generateVerificationToken(email);
        await sendVerificationEmail(email, token);
      } catch (emailError) {
        console.error("Verification email delivery failed:", emailError);

        // Compensate to avoid leaving a partially-created account on email failure.
        try {
          await prisma.$transaction([
            prisma.verificationToken.deleteMany({ where: { identifier: email } }),
            prisma.user.delete({ where: { id: user.id } }),
          ]);
        } catch (rollbackError) {
          console.error("Failed to rollback registration after email error:", rollbackError);
        }

        return NextResponse.json(
          { error: "Unable to send verification email. Please try again." },
          { status: 503 }
        );
      }
    } else {
      // Auto-verify the user when email verification is disabled
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    return NextResponse.json(
      {
        success: true,
        emailVerificationRequired: emailVerificationEnabled,
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
