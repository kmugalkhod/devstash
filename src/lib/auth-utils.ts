import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Get the authenticated user's ID. Redirects to /sign-in if not authenticated.
 */
export async function getAuthUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  return session.user.id;
}
