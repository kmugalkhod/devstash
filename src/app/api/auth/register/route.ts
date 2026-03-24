import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  registerLimiter,
  getClientIp,
  checkRateLimit,
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
    const ip = getClientIp(request);
    const { success, reset } = await checkRateLimit(registerLimiter, ip);

    if (!success) {
      return rateLimitResponse(reset);
    }

    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input. Check your name, email, and password." },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

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
      // Generate verification token and send email
      const token = await generateVerificationToken(email);
      await sendVerificationEmail(email, token);
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
