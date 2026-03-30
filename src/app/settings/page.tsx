import { getAuthUserId } from "@/lib/auth-utils";
import { getProfileUser } from "@/lib/db/profile";
import { AccountActions } from "@/components/settings/AccountActions";
import { EditorPreferencesSection } from "@/components/settings/EditorPreferencesSection";

export default async function SettingsPage() {
  const userId = await getAuthUserId();
  const user = await getProfileUser(userId);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences.
        </p>
      </div>
      <EditorPreferencesSection />
      <AccountActions hasPassword={user.hasPassword} />
    </div>
  );
}