import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function generateVerificationToken(email: string) {
  const token = randomBytes(32).toString("hex");
  const hashedToken = hashToken(token);
  const expires = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
  );

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires,
    },
  });

  return token;
}

export async function validateVerificationToken(token: string) {
  const hashedToken = hashToken(token);

  // Primary lookup uses hashed token storage.
  // Fallback keeps pre-migration plaintext tokens valid until they expire.
  let record = await prisma.verificationToken.findUnique({
    where: { token: hashedToken },
  });

  if (!record) {
    record = await prisma.verificationToken.findUnique({
      where: { token },
    });
  }

  if (!record) return null;
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { token: record.token },
    });
    return null;
  }

  // Delete the token (single-use)
  await prisma.verificationToken.delete({
    where: { token: record.token },
  });

  return record.identifier; // returns the email
}
