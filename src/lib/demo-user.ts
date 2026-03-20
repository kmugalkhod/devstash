// TODO: Replace with actual authentication (NextAuth)
import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";
const DEMO_USER_FALLBACK_ID = "demo-user-id";

export async function getDemoUserId(): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });
  return user?.id ?? DEMO_USER_FALLBACK_ID;
}
