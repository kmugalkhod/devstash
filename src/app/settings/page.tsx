import { getAuthUserId } from "@/lib/auth-utils";
import { getProfileUser } from "@/lib/db/profile";
import { AccountActions } from "@/components/settings/AccountActions";
import { EditorPreferencesSection } from "@/components/settings/EditorPreferencesSection";
import { SubscriptionSection } from "@/components/settings/SubscriptionSection";
import { prisma } from "@/lib/prisma";
import { isUserPro } from "@/lib/pro";

export default async function SettingsPage() {
  const userId = await getAuthUserId();
  const [user, subscription, isPro] = await Promise.all([
    getProfileUser(userId),
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { proPlan: true, proExpiresAt: true },
    }),
    isUserPro(userId),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences.
        </p>
      </div>
      <SubscriptionSection
        isPro={isPro}
        plan={subscription.proPlan}
        proExpiresAt={subscription.proExpiresAt?.toISOString() ?? null}
      />
      <EditorPreferencesSection />
      <AccountActions hasPassword={user.hasPassword} />
    </div>
  );
}