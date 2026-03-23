import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "EMAIL_NOT_VERIFIED";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        // Only allow linking to an existing account if GitHub has verified the email
        if (!profile?.email_verified) {
          return false;
        }

        // Check if a credential-based account already exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true },
        });

        if (existingUser) {
          const hasGitHubAccount = existingUser.accounts.some(
            (a) => a.provider === "github"
          );

          if (!hasGitHubAccount) {
            // Link GitHub account to existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                token_type: account.token_type,
                scope: account.scope,
              },
            });

            // Ensure emailVerified is set
            if (!existingUser.emailVerified) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { emailVerified: new Date() },
              });
            }

            return true;
          }
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  ...authConfig,
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const emailVerificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED !== "false";
        if (emailVerificationEnabled && !user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});
