import Link from "next/link";
import { validateVerificationToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";
import { AuthHeader } from "../AuthHeader";
import { CheckCircle2, XCircle } from "lucide-react";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let success = false;

  if (token) {
    const email = await validateVerificationToken(token);

    if (email) {
      await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      });
      success = true;
    }
  }

  return (
    <div className="space-y-6 text-center">
      <AuthHeader
        title={success ? "Email verified" : "Verification failed"}
        subtitle={
          success
            ? "Your email has been verified successfully"
            : "The verification link is invalid or has expired"
        }
      />

      <div className="flex justify-center">
        {success ? (
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="size-8 text-emerald-400" />
          </div>
        ) : (
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="size-8 text-destructive" />
          </div>
        )}
      </div>

      <p className="text-sm text-zinc-400">
        {success
          ? "You can now sign in with your email and password."
          : "Please try registering again or contact support if the issue persists."}
      </p>

      <Link
        href={success ? "/sign-in?verified=true" : "/sign-in"}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
      >
        {success ? "Sign in to your account" : "Back to sign in"}
      </Link>
    </div>
  );
}
